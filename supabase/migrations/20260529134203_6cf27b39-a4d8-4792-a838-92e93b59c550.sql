ALTER TABLE public.pedidos 
ADD COLUMN IF NOT EXISTS valor_frete NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS numero_endereco TEXT;

-- Update existing policies to ensure they still apply (though typically they apply to the whole table)
-- No changes needed to policies if they are based on table access.
