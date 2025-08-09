-- Criar tabela de solicitações
CREATE TABLE IF NOT EXISTS public.item_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    grupo_escoteiro TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    item_solicitado TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    mensagem_adicional TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de solicitações
ALTER TABLE public.item_requests ENABLE ROW LEVEL SECURITY;

-- Políticas para solicitações - qualquer um pode inserir
CREATE POLICY "Anyone can create requests" 
ON public.item_requests 
FOR INSERT 
WITH CHECK (true);

-- Apenas admins podem visualizar solicitações
CREATE POLICY "Admins can view all requests" 
ON public.item_requests 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
));

-- Trigger para item_requests
CREATE TRIGGER update_item_requests_updated_at
    BEFORE UPDATE ON public.item_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();