CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Use GRANT to set permissions
GRANT SELECT ON public.admin_users TO authenticated;
GRANT ALL ON public.admin_users TO service_role;

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read the table to check if they are admins
CREATE POLICY "Allow authenticated users to read admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);

-- Insert the primary admin email
INSERT INTO public.admin_users (email) 
VALUES ('gabryel.souza177@gmail.com')
ON CONFLICT (email) DO NOTHING;
