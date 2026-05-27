-- Concede permissão de UPDATE
GRANT UPDATE ON public.orders TO anon;
GRANT UPDATE ON public.orders TO authenticated;

-- Remove política de update antiga
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Cria política para permitir atualização pública
-- Nota: Usado na página de sucesso para marcar como 'paid'
CREATE POLICY "Anyone can update orders" 
ON public.orders 
FOR UPDATE 
TO public 
USING (true)
WITH CHECK (true);
