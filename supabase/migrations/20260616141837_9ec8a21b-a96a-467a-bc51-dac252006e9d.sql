
-- ====== PRODUCTS ======
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can view all products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Public can delete products" ON public.products;
DROP POLICY IF EXISTS "Public can insert products" ON public.products;
DROP POLICY IF EXISTS "Public can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Public can view products" ON public.products
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.is_admin());

-- ====== PEDIDOS (enable RLS, anon insert, admin read/write) ======
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT INSERT ON public.pedidos TO anon;
GRANT ALL ON public.pedidos TO service_role;

DROP POLICY IF EXISTS "Anyone can insert pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins can view pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins can update pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins can delete pedidos" ON public.pedidos;

CREATE POLICY "Anyone can insert pedidos" ON public.pedidos
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view pedidos" ON public.pedidos
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update pedidos" ON public.pedidos
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete pedidos" ON public.pedidos
  FOR DELETE TO authenticated USING (public.is_admin());

-- ====== ORDERS (same pattern) ======
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT INSERT ON public.orders TO anon;
GRANT ALL ON public.orders TO service_role;

DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

CREATE POLICY "Anyone can insert orders" ON public.orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view orders" ON public.orders
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.is_admin());

-- ====== CUSTOMERS ======
DROP POLICY IF EXISTS "Allow public insert for customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public select for customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can view customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can update customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can delete customers" ON public.customers;

CREATE POLICY "Anyone can insert customers" ON public.customers
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view customers" ON public.customers
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update customers" ON public.customers
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete customers" ON public.customers
  FOR DELETE TO authenticated USING (public.is_admin());

-- ====== EXPENSES (admin only) ======
DROP POLICY IF EXISTS "Authenticated users can delete expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can view expenses" ON public.expenses;

CREATE POLICY "Admins manage expenses" ON public.expenses
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ====== SALES (admin only) ======
DROP POLICY IF EXISTS "Authenticated users can delete sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can update sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;

CREATE POLICY "Admins manage sales" ON public.sales
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ====== SITE_SETTINGS ======
DROP POLICY IF EXISTS "Admin update site_settings" ON public.site_settings;
-- keep "Admins can update site settings" + "Public read site_settings"

-- ====== STORAGE objects (product-images): public read, admin write ======
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload product images" ON storage.objects;

CREATE POLICY "Admin upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "Admin update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
CREATE POLICY "Admin delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());
