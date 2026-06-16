
-- 1) Add user_id to admin_users and backfill from auth.users by email
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_user_id_key ON public.admin_users(user_id);

UPDATE public.admin_users a
SET user_id = u.id
FROM auth.users u
WHERE a.user_id IS NULL
  AND lower(u.email) = lower(a.email);

-- 2) Harden is_admin(): check by auth.uid(), not by JWT email
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

-- Restrict EXECUTE: only signed-in users can call is_admin()
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- 3) Lock search_path on remaining SECURITY DEFINER / trigger functions
ALTER FUNCTION public.handle_site_settings_update() SET search_path = public;
ALTER FUNCTION public.handle_new_pedido_notification() SET search_path = public;

-- 4) Drop legacy trigger function that embedded a hardcoded service-role key
DROP FUNCTION IF EXISTS public.send_whatsapp_on_insert() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_whatsapp_notification() CASCADE;
