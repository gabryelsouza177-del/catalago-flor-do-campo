ALTER TABLE public.pedidos ADD COLUMN observacoes TEXT;

-- Grant permissions again just in case
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO anon;
GRANT ALL ON public.pedidos TO service_role;