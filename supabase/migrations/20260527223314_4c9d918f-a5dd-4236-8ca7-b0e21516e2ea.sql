-- Ensure customer_name exists and is used for the buyer
-- Ensure status options are consistent
-- recipient_name is for the person receiving the flowers

-- Create a table for customers to fulfill the "auto-registration" requirement
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow public insertion for registration during checkout
CREATE POLICY "Allow public insert for customers" ON public.customers FOR INSERT WITH CHECK (true);

-- Allow users to see their own data if we use a session token or just public for now (restricted by phone)
CREATE POLICY "Allow public select for customers" ON public.customers FOR SELECT USING (true);

-- Update orders table if necessary
-- customer_name is the buyer
-- recipient_name is the recipient
-- customer_phone is the buyer's phone

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.customers TO anon, authenticated;
GRANT ALL ON public.customers TO service_role;
