-- Verificar se RLS está habilitado na tabela inventory_items
-- e criar política para permitir leitura pública
DROP POLICY IF EXISTS "Anyone can view inventory items" ON public.inventory_items;

CREATE POLICY "Anyone can view inventory items" 
ON public.inventory_items 
FOR SELECT 
USING (true);

-- Política para permitir que apenas admins façam modificações
DROP POLICY IF EXISTS "Admins can modify inventory items" ON public.inventory_items;

CREATE POLICY "Admins can modify inventory items" 
ON public.inventory_items 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
));