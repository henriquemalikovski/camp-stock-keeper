-- Adicionar campo status à tabela item_requests
ALTER TABLE public.item_requests 
ADD COLUMN status text NOT NULL DEFAULT 'pendente';

-- Criar índice para melhor performance nas consultas por status
CREATE INDEX idx_item_requests_status ON public.item_requests(status);

-- Adicionar política RLS para permitir que usuários autenticados atualizem o status
CREATE POLICY "Authenticated users can update item request status" 
ON public.item_requests 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);