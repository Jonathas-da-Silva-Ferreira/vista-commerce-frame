
-- Re-create the trigger functions inside the private schema so they are
-- not reachable through the PostgREST RPC surface. Triggers can reference
-- functions in any schema, so behavior is unchanged.

drop trigger if exists reviews_set_verified_purchase_trg on public.reviews;
drop trigger if exists reviews_guard_update_trg on public.reviews;
drop function if exists public.reviews_set_verified_purchase();
drop function if exists public.reviews_guard_update();

create or replace function private.reviews_set_verified_purchase()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid_uuid uuid;
begin
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

create or replace function private.reviews_guard_update()
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
    raise exception 'verified_purchase is immutable';
  end if;

  if new.is_hidden <> old.is_hidden and not is_admin then
    raise exception 'Only admins can hide or restore reviews';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger reviews_set_verified_purchase_trg
before insert on public.reviews
for each row execute function private.reviews_set_verified_purchase();

create trigger reviews_guard_update_trg
before update on public.reviews
for each row execute function private.reviews_guard_update();
