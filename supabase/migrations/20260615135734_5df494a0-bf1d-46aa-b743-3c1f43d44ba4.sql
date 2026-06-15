
create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;
grant execute on function private.has_role(uuid, public.app_role) to anon, authenticated;

-- user_roles
drop policy if exists "Admins delete roles" on public.user_roles;
drop policy if exists "Admins insert roles" on public.user_roles;
drop policy if exists "Admins view all roles" on public.user_roles;
create policy "Admins delete roles" on public.user_roles for delete to authenticated using (private.has_role(auth.uid(), 'admin'));
create policy "Admins insert roles" on public.user_roles for insert to authenticated with check (private.has_role(auth.uid(), 'admin'));
create policy "Admins view all roles" on public.user_roles for select to authenticated using (private.has_role(auth.uid(), 'admin'));

-- categories
drop policy if exists "Admins manage categories - delete" on public.categories;
drop policy if exists "Admins manage categories - insert" on public.categories;
drop policy if exists "Admins manage categories - update" on public.categories;
drop policy if exists "Public reads enabled categories" on public.categories;
create policy "Admins manage categories - delete" on public.categories for delete to authenticated using (private.has_role(auth.uid(), 'admin'));
create policy "Admins manage categories - insert" on public.categories for insert to authenticated with check (private.has_role(auth.uid(), 'admin'));
create policy "Admins manage categories - update" on public.categories for update to authenticated using (private.has_role(auth.uid(), 'admin'));
create policy "Public reads enabled categories" on public.categories for select to anon, authenticated using (enabled = true or private.has_role(auth.uid(), 'admin'));

-- products
drop policy if exists "Admins delete any product" on public.products;
drop policy if exists "Admins update any product" on public.products;
drop policy if exists "Public reads active products" on public.products;
create policy "Admins delete any product" on public.products for delete to authenticated using (private.has_role(auth.uid(), 'admin'));
create policy "Admins update any product" on public.products for update to authenticated using (private.has_role(auth.uid(), 'admin'));
create policy "Public reads active products" on public.products for select to anon, authenticated
  using (status = 'active' or seller_id = auth.uid() or private.has_role(auth.uid(), 'admin'));

-- orders
drop policy if exists "Admins update orders" on public.orders;
drop policy if exists "Admins view all orders" on public.orders;
create policy "Admins update orders" on public.orders for update to authenticated using (private.has_role(auth.uid(), 'admin'));
create policy "Admins view all orders" on public.orders for select to authenticated using (private.has_role(auth.uid(), 'admin'));

-- banners
drop policy if exists "Admins delete banners" on public.banners;
drop policy if exists "Admins insert banners" on public.banners;
drop policy if exists "Admins update banners" on public.banners;
drop policy if exists "Public reads live banners" on public.banners;
create policy "Admins delete banners" on public.banners for delete to authenticated using (private.has_role(auth.uid(), 'admin'));
create policy "Admins insert banners" on public.banners for insert to authenticated with check (private.has_role(auth.uid(), 'admin'));
create policy "Admins update banners" on public.banners for update to authenticated using (private.has_role(auth.uid(), 'admin'));
create policy "Public reads live banners" on public.banners for select to anon, authenticated using (
  ((active = true) and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()))
  or private.has_role(auth.uid(), 'admin')
);

-- order_items
drop policy if exists "Admins view all order items" on public.order_items;
create policy "Admins view all order items" on public.order_items for select to authenticated using (private.has_role(auth.uid(), 'admin'));

-- profiles
drop policy if exists "Admins update any profile" on public.profiles;
drop policy if exists "Admins view all profiles" on public.profiles;
create policy "Admins update any profile" on public.profiles for update to authenticated using (private.has_role(auth.uid(), 'admin'));
create policy "Admins view all profiles" on public.profiles for select to authenticated using (private.has_role(auth.uid(), 'admin'));

-- Drop the public-schema definer helper (now unreferenced)
drop function if exists public.has_role(uuid, public.app_role);

-- Column-level grants: hide sensitive internal product columns from anon
revoke select on public.products from anon;
grant select (id, category_id, name, description, price, image_url, status, created_at, updated_at)
  on public.products to anon;
