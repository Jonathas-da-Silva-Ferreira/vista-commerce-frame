
-- 1) Products INSERT must require seller (or admin) role, not just any authenticated user.
DROP POLICY IF EXISTS "Sellers create own products" ON public.products;
CREATE POLICY "Sellers create own products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = seller_id
  AND (
    private.has_role(auth.uid(), 'seller'::public.app_role)
    OR private.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

-- 2) Split the products SELECT policy per role for clarity. Column-level
--    grants already restrict anon to non-sensitive columns; this makes the
--    intent explicit at the policy layer too.
DROP POLICY IF EXISTS "Public reads active products" ON public.products;

CREATE POLICY "Anon reads active products"
ON public.products
FOR SELECT
TO anon
USING (status = 'active'::public.product_status);

CREATE POLICY "Authenticated reads products"
ON public.products
FOR SELECT
TO authenticated
USING (
  status = 'active'::public.product_status
  OR seller_id = auth.uid()
  OR private.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 3) Reviews: hide reviewer user_id from anonymous visitors via column-level
--    SELECT grants. Authenticated users keep full access so the UI can detect
--    "my review" and admins can moderate.
REVOKE SELECT ON public.reviews FROM anon;
GRANT SELECT (
  id, product_id, rating, title, comment,
  verified_purchase, is_hidden, created_at, updated_at
) ON public.reviews TO anon;
GRANT SELECT ON public.reviews TO authenticated;
