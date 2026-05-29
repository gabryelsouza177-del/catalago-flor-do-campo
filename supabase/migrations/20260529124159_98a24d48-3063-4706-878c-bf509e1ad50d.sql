-- Disable RLS on orders table as requested by user to debug permissions/syntax issues
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Ensure items is text
ALTER TABLE orders ALTER COLUMN items TYPE TEXT;

-- Redefine trigger function to be extremely simple and avoid jsonb issues
CREATE OR REPLACE FUNCTION public.notify_new_order_whatsapp()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  -- Using row_to_json which is more basic than to_jsonb
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
