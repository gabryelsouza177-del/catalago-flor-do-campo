-- Create a function to call the edge function
CREATE OR REPLACE FUNCTION public.notify_new_order_whatsapp()
RETURNS TRIGGER AS $$
BEGIN
  -- We use net.http_post to call the edge function asynchronously
  -- This requires the pg_net extension to be enabled in Supabase
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

-- Drop trigger if exists and create it
DROP TRIGGER IF EXISTS on_order_created_whatsapp ON public.orders;
CREATE TRIGGER on_order_created_whatsapp
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_order_whatsapp();
