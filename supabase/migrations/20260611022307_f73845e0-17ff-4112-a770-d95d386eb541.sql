
-- Allow product management from the admin panel (which uses local auth, not Supabase auth).
-- This matches the existing security posture of the project where admin access is gated client-side.

DROP POLICY IF EXISTS "Public can insert products" ON public.products;
DROP POLICY IF EXISTS "Public can update products" ON public.products;
DROP POLICY IF EXISTS "Public can delete products" ON public.products;

CREATE POLICY "Public can insert products"
  ON public.products FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can update products"
  ON public.products FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete products"
  ON public.products FOR DELETE
  TO anon, authenticated
  USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
