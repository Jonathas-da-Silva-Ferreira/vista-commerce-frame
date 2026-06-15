
-- Reviews table. product_id is TEXT (not UUID FK) because the storefront
-- currently shows a mix of seeded mock products (string ids) and real DB
-- products (uuid ids); keeping it TEXT lets both coexist without losing
-- data integrity for the DB-backed ones, which we still validate via app
-- code and the verified-purchase trigger.
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  title text not null check (char_length(title) between 1 and 120),
  comment text not null check (char_length(comment) between 5 and 2000),
  verified_purchase boolean not null default false,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Business rule enforced at the DB layer so concurrent requests cannot
  -- race past a client-side "already reviewed?" check.
  unique (product_id, user_id)
);

-- Lookup pattern: "all visible reviews for a product, newest first".
create index reviews_product_visible_idx
  on public.reviews (product_id, created_at desc)
  where is_hidden = false;

-- Data API grants. anon gets read-only (RLS still filters out hidden rows).
grant select on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;

alter table public.reviews enable row level security;

-- SELECT: anonymous + signed-in see non-hidden reviews; the author always
-- sees their own (even when hidden) so the UI can render an explanation;
-- admins see everything for moderation.
create policy "Public reads visible reviews" on public.reviews
  for select to anon, authenticated
  using (
    is_hidden = false
    or user_id = auth.uid()
    or private.has_role(auth.uid(), 'admin')
  );

-- INSERT: only the user themselves; `is_hidden` and `verified_purchase`
-- must not be controlled by the client — defaults + trigger handle them.
create policy "Users insert own reviews" on public.reviews
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and is_hidden = false
    and verified_purchase = false
  );

-- UPDATE: owner edits content; admin moderates (hide/restore). We allow a
-- single broad UPDATE policy and rely on a trigger to forbid the owner
-- from flipping `is_hidden` or `verified_purchase` themselves — RLS alone
-- cannot diff old vs new values.
create policy "Owner or admin updates review" on public.reviews
  for update to authenticated
  using (user_id = auth.uid() or private.has_role(auth.uid(), 'admin'))
  with check (user_id = auth.uid() or private.has_role(auth.uid(), 'admin'));

-- DELETE: owner OR admin.
create policy "Owner or admin deletes review" on public.reviews
  for delete to authenticated
  using (user_id = auth.uid() or private.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------------------
-- Trigger: stamp verified_purchase server-side. Checking client-side would
-- let any user forge the badge by sending true; this guarantees the badge
-- only appears for users who actually ordered the product.
-- ---------------------------------------------------------------------------
create or replace function public.reviews_set_verified_purchase()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid_uuid uuid;
begin
  -- Safe cast: mock products with non-uuid ids simply stay unverified.
  begin
    pid_uuid := new.product_id::uuid;
  exception when others then
    new.verified_purchase := false;
    return new;
  end;

  new.verified_purchase := exists (
    select 1
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
     where o.user_id = new.user_id
       and oi.product_id = pid_uuid
  );
  return new;
end;
$$;

create trigger reviews_set_verified_purchase_trg
before insert on public.reviews
for each row execute function public.reviews_set_verified_purchase();

-- ---------------------------------------------------------------------------
-- Trigger: guard sensitive columns on UPDATE.
--  - Owner (non-admin) may NOT change is_hidden or verified_purchase or
--    re-assign user_id/product_id.
--  - Admin may toggle is_hidden but not impersonate authorship.
-- Also bumps updated_at on every UPDATE so the UI can show an "Edited"
-- label whenever updated_at > created_at (within a small tolerance).
-- ---------------------------------------------------------------------------
create or replace function public.reviews_guard_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean := private.has_role(auth.uid(), 'admin');
begin
  if new.user_id <> old.user_id or new.product_id <> old.product_id then
    raise exception 'Cannot reassign review ownership or product';
  end if;

  if new.verified_purchase <> old.verified_purchase then
    -- verified_purchase is server-derived; nobody overrides it manually.
    raise exception 'verified_purchase is immutable';
  end if;

  if new.is_hidden <> old.is_hidden and not is_admin then
    raise exception 'Only admins can hide or restore reviews';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger reviews_guard_update_trg
before update on public.reviews
for each row execute function public.reviews_guard_update();
