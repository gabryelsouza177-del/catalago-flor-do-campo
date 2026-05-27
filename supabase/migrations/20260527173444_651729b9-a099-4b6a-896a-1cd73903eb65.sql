-- Create a helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant permissions for orders table
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- Update RLS policies for orders
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

CREATE POLICY "Allow public insertion" 
ON public.orders FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Allow admins to select" 
ON public.orders FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Allow admins to update" 
ON public.orders FOR UPDATE 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Allow admins to delete" 
ON public.orders FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Fix grants and policies for other tables to ensure they are accessible
GRANT SELECT ON public.admin_users TO authenticated;
GRANT ALL ON public.admin_users TO service_role;

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

GRANT SELECT ON public.logistics_settings TO anon, authenticated;
GRANT UPDATE ON public.logistics_settings TO authenticated;
GRANT ALL ON public.logistics_settings TO service_role;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- Ensure RLS is enabled everywhere it should be
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Site settings update policy
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings" 
ON public.site_settings FOR UPDATE 
TO authenticated 
USING (public.is_admin());

-- Logistics settings update policy
DROP POLICY IF EXISTS "Admins can update logistics settings" ON public.logistics_settings;
CREATE POLICY "Admins can update logistics settings" 
ON public.logistics_settings FOR UPDATE 
TO authenticated 
USING (public.is_admin());

-- Products policies
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view products" 
ON public.products FOR SELECT 
TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" 
ON public.products FOR ALL 
TO authenticated 
USING (public.is_admin());
