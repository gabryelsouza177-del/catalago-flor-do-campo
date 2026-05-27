-- Grant permissions to public roles for guest checkout flow
GRANT SELECT, INSERT, UPDATE ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;

-- Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public insertion" ON public.orders;
DROP POLICY IF EXISTS "Allow public select" ON public.orders;
DROP POLICY IF EXISTS "Allow public update" ON public.orders;
DROP POLICY IF EXISTS "Permitir inserção pública" ON public.orders;
DROP POLICY IF EXISTS "Allow admins to select" ON public.orders;
DROP POLICY IF EXISTS "Allow admins to update" ON public.orders;
DROP POLICY IF EXISTS "Allow admins to delete" ON public.orders;

-- Create policies for guest checkout
-- Allow anyone to insert an order
CREATE POLICY "Allow public insertion" 
ON public.orders 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow anyone to select orders (required for the success page to show order details to guest users)
CREATE POLICY "Allow public select" 
ON public.orders 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- Allow anyone to update orders (required for Success page to update payment_status to 'paid')
CREATE POLICY "Allow public update" 
ON public.orders 
FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- Allow admins to delete orders
CREATE POLICY "Allow admins to delete" 
ON public.orders 
FOR DELETE 
TO authenticated 
USING (public.is_admin());
