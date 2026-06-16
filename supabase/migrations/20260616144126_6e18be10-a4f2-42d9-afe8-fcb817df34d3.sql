-- Grant table privileges (PostgREST requires explicit GRANTs in addition to RLS)
GRANT INSERT ON public.pedidos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;

GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- customers: anon needs INSERT + UPDATE because checkout uses upsert(onConflict:'phone')
GRANT INSERT, UPDATE ON public.customers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;

-- Allow anon to upsert customers (existing INSERT policy is fine; add UPDATE policy for upsert path)
DROP POLICY IF EXISTS "Anyone can upsert customers" ON public.customers;
CREATE POLICY "Anyone can upsert customers"
ON public.customers FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);