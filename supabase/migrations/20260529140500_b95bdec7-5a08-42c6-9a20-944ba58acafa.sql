-- Add columns to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS bouquets_delivery_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS only_pickup_mode BOOLEAN DEFAULT false;

-- Ensure the existing row has these values if it exists
UPDATE public.site_settings 
SET bouquets_delivery_enabled = true, only_pickup_mode = false
WHERE bouquets_delivery_enabled IS NULL OR only_pickup_mode IS NULL;
