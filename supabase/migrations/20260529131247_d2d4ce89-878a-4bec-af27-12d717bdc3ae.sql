-- Enable the pg_net extension to make HTTP requests
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.send_whatsapp_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- We use net.http_post to call the Edge Function
  -- The URL is constructed using the project reference
  -- The Authorization header uses the service_role key to bypass RLS/Auth if needed
  PERFORM
    net.http_post(
      url := 'https://bqoanaymxprxjayhenda.supabase.co/functions/v1/whatsapp-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxb2FuYXlteHByeGpheWhlbmRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkyMjA1NCwiZXhwIjoyMDg5NDk4MDU0fQ.ETjHTDgXLQZV0P0ZoiE8MI88n_K6R0FXeLZkcq2YHu4'
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW)
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS tr_send_whatsapp_on_pedido_insert ON public.pedidos;
CREATE TRIGGER tr_send_whatsapp_on_pedido_insert
AFTER INSERT ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.send_whatsapp_on_insert();
