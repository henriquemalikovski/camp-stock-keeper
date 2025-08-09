-- Criar tabela de solicitações de itens
CREATE TABLE public.item_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  grupo_escoteiro TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  item_solicitado TEXT NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  mensagem_adicional TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de solicitações
ALTER TABLE public.item_requests ENABLE ROW LEVEL SECURITY;

-- Permitir que qualquer pessoa possa criar solicitações (INSERT)
CREATE POLICY "Anyone can create item requests" 
ON public.item_requests 
FOR INSERT 
WITH CHECK (true);

-- Apenas usuários autenticados podem visualizar solicitações (SELECT)
CREATE POLICY "Authenticated users can view item requests" 
ON public.item_requests 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_item_requests_updated_at
BEFORE UPDATE ON public.item_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert profile on signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir usuário administrador (será criado quando fizer primeiro login)
-- Como não podemos inserir diretamente em auth.users, vamos criar uma política especial para admin

-- Atualizar políticas do inventory_items para só permitir admin editar/deletar
DROP POLICY IF EXISTS "Allow all operations on inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "Anyone can view inventory items" ON public.inventory_items;

-- Qualquer pessoa pode visualizar itens
CREATE POLICY "Anyone can view inventory items" 
ON public.inventory_items 
FOR SELECT 
USING (true);

-- Apenas usuários autenticados podem inserir itens
CREATE POLICY "Authenticated users can insert inventory items" 
ON public.inventory_items 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Apenas usuários autenticados podem atualizar itens
CREATE POLICY "Authenticated users can update inventory items" 
ON public.inventory_items 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Apenas usuários autenticados podem deletar itens
CREATE POLICY "Authenticated users can delete inventory items" 
ON public.inventory_items 
FOR DELETE 
USING (auth.uid() IS NOT NULL);