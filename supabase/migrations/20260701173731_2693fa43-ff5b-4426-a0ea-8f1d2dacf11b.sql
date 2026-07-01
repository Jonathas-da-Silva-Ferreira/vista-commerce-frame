-- Revoke all anon privileges on profiles: no anonymous access at all.
REVOKE ALL ON public.profiles FROM anon;

-- Recreate the sellers UPDATE policy with an explicit role check so only
-- users holding the 'seller' or 'admin' role can update their own products.
DROP POLICY IF EXISTS "Sellers update own products" ON public.products;
CREATE POLICY "Sellers update own products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  auth.uid() = seller_id
  AND (
    private.has_role(auth.uid(), 'seller'::app_role)
    OR private.has_role(auth.uid(), 'admin'::app_role)
  )
)
WITH CHECK (
  auth.uid() = seller_id
  AND (
    private.has_role(auth.uid(), 'seller'::app_role)
    OR private.has_role(auth.uid(), 'admin'::app_role)
  )
);