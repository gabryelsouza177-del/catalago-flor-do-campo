-- Update function to set search_path and use to_jsonb for better JSON handling
CREATE OR REPLACE FUNCTION public.notify_new_order_whatsapp()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  -- We use net.http_post to call the edge function asynchronously
  -- Using to_jsonb(NEW) ensures the record is passed as a structured object
  PERFORM
    net.http_post(
      url := 'https://bqoanaymxprxjayhenda.supabase.co/functions/v1/whatsapp-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.headers', true)::jsonb->>'apikey'
      ),
      body := jsonb_build_object('record', to_jsonb(NEW))::text
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
