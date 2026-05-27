-- Grant execute on the admin check function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- Ensure all public tables have SELECT grants for the data API
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.logistics_settings TO anon, authenticated;

-- Add the email mentioned by the user to admin_users if not already there
INSERT INTO public.admin_users (email)
VALUES ('gabryel1310@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Double check orders grants
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
