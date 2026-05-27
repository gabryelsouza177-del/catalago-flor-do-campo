ALTER TABLE public.logistics_settings 
ADD COLUMN price_per_km NUMERIC DEFAULT 2.50,
ADD COLUMN min_delivery_fee NUMERIC DEFAULT 12.00,
ADD COLUMN eligible_categories TEXT[] DEFAULT ARRAY['Buquês'],
ADD COLUMN fixed_delivery_fee NUMERIC DEFAULT 20.00;

ALTER TABLE public.orders
ADD COLUMN delivery_distance NUMERIC,
ADD COLUMN delivery_address TEXT;
