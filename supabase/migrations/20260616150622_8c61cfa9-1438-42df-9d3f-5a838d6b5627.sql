ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS data_entrega DATE,
  ADD COLUMN IF NOT EXISTS horario_entrega TEXT;