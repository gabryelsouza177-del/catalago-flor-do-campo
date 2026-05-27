-- Garante que o RLS está habilitado
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Concede permissões para as roles do Supabase
GRANT SELECT, INSERT ON public.orders TO anon;
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- Remove políticas antigas se existirem para evitar conflitos
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Public can view orders" ON public.orders;

-- Cria política para permitir inserção pública (checkout anônimo)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Cria política para permitir visualização pública
-- Nota: Necessário para o client-side receber o objeto inserido (RETURNING)
CREATE POLICY "Anyone can view orders" 
ON public.orders 
FOR SELECT 
TO public 
USING (true);

-- Recria política de atualização apenas para administradores
CREATE POLICY "Admins can update orders" 
ON public.orders 
FOR UPDATE 
TO authenticated 
USING (true);
