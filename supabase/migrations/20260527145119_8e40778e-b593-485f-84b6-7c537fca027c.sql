ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS wreath_ribbon_message TEXT,
ADD COLUMN IF NOT EXISTS wreath_honoree_name TEXT,
ADD COLUMN IF NOT EXISTS wreath_location TEXT,
ADD COLUMN IF NOT EXISTS wreath_ceremony_time TEXT;