-- =====================================================================
-- ENUMS
-- Why enums: role and status fields have a fixed, small domain. Using
-- Postgres enums prevents typos and gives us referential safety at the
-- database layer instead of relying on app-level validation.
-- =====================================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'seller', 'customer');
CREATE TYPE public.account_status AS ENUM ('active', 'suspended');
CREATE TYPE public.product_status AS ENUM ('active', 'hidden', 'deleted');
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded');

-- =====================================================================
-- updated_at trigger function (shared)
-- Centralized so every table can reuse the same logic and we avoid
-- drift between near-identical trigger bodies.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================================
-- PROFILES
-- Why a separate profiles table: never read from auth.users in app code.
-- This is the public-safe mirror that the client and admins query.
-- =====================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  status public.account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- USER ROLES
-- Why a dedicated table (not a column on profiles): putting role on the
-- user-editable profile row enables privilege escalation. RLS must read
-- roles from a table that the user cannot self-edit.
-- =====================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- has_role(): SECURITY DEFINER to avoid recursive RLS.
-- Why SECURITY DEFINER: policies that call this function would otherwise
-- re-trigger user_roles RLS and recurse. Definer runs as the owner.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =====================================================================
-- Profiles policies
-- Why "view own profile" + "admins view all": users need to load their
-- own row to render the header; admins need everyone for management.
-- =====================================================================
CREATE POLICY "Users view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins update any profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Profile rows are inserted by the handle_new_user trigger (definer),
-- so we do NOT expose INSERT to clients.

-- =====================================================================
-- user_roles policies
-- Users may read their own roles (to know if they are admin/seller);
-- admins may read and manage everyone. Self-assigning roles is blocked
-- by the absence of an INSERT/UPDATE policy for non-admins.
-- =====================================================================
CREATE POLICY "Users view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- handle_new_user(): runs on auth.users INSERT.
-- Why: keeps profile creation and default role assignment atomic with
-- signup. Auto-promotes the configured bootstrap admin email so the
-- first admin exists without manual SQL.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  -- Every new user starts as a customer; sellers/admins are added on top.
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');

  -- Bootstrap admin: promote the designated email automatically.
  IF NEW.email = 'jonathasx.525@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- CATEGORIES
-- Self-referencing parent_id supports subcategories without a second
-- table. enabled flag lets admins hide a whole branch from the store.
-- =====================================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Public reads enabled categories"
  ON public.categories FOR SELECT TO anon, authenticated
  USING (enabled = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage categories - insert"
  ON public.categories FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage categories - update"
  ON public.categories FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage categories - delete"
  ON public.categories FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- PRODUCTS
-- status enum supports the "hide without deleting" requirement: 'hidden'
-- removes from storefront but admins/sellers still see it; 'deleted' is
-- a soft-delete that can be restored.
-- =====================================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  status public.product_status NOT NULL DEFAULT 'active',
  sales_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_seller ON public.products(seller_id);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storefront sees only active products; sellers see their own; admins see everything.
CREATE POLICY "Public reads active products"
  ON public.products FOR SELECT TO anon, authenticated
  USING (
    status = 'active'
    OR seller_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Sellers create own products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers update own products"
  ON public.products FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Admins update any product"
  ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sellers delete own products"
  ON public.products FOR DELETE TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Admins delete any product"
  ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- BANNERS
-- starts_at/ends_at allow scheduled publication. active flag is a manual
-- override so admins can pull a banner without rewriting dates.
-- =====================================================================
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.banners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER banners_set_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Public reads live banners"
  ON public.banners FOR SELECT TO anon, authenticated
  USING (
    (active = true
      AND (starts_at IS NULL OR starts_at <= now())
      AND (ends_at IS NULL OR ends_at >= now()))
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins insert banners"
  ON public.banners FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update banners"
  ON public.banners FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete banners"
  ON public.banners FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================================
-- ORDERS + ORDER ITEMS
-- Why a snapshot column (unit_price) on items: product prices change.
-- Historical orders must remain accurate independent of current price.
-- =====================================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);

GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER orders_set_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users view own orders"
  ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all orders"
  ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order items visibility piggy-backs on the parent order's ownership.
CREATE POLICY "Users view own order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND o.user_id = auth.uid()
  ));

CREATE POLICY "Admins view all order items"
  ON public.order_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert items into own orders"
  ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND o.user_id = auth.uid()
  ));
