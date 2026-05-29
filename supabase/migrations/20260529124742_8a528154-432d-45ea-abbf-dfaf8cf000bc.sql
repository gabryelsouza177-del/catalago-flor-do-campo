-- Drop existing table and recreate as requested
DROP TABLE IF EXISTS public.orders CASCADE;

CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_name TEXT,
  customer_phone TEXT,
  recipient_name TEXT,
  items TEXT, -- Salvando como texto para não dar erro de JSON
  total_price NUMERIC,
  status TEXT DEFAULT 'Pendente',
  payment_method TEXT,
  delivery_type TEXT,
  address TEXT,
  card_message TEXT,
  wreath_details TEXT
);

-- Use GRANT to set permissions for different roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- Disable Row Level Security as requested for debugging
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Re-enable the trigger for WhatsApp notifications with the new schema
CREATE OR REPLACE FUNCTION public.notify_new_order_whatsapp()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://bqoanaymxprxjayhenda.supabase.co/functions/v1/whatsapp-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.headers', true)::jsonb->>'apikey'
      ),
      body := json_build_object('record', row_to_json(NEW))::text
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_created_whatsapp
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_order_whatsapp();
