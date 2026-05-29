-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Update function to set search_path
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
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
