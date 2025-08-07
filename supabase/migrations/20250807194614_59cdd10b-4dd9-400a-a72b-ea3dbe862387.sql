-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nivel TEXT NOT NULL CHECK (nivel IN ('Não Tem', 'Nivel 1', 'Nivel 2', 'Nivel 3')),
  tipo TEXT NOT NULL CHECK (tipo IN ('Arganel', 'Certificado', 'Distintivo', 'Distintivo de Progressão', 'Distintivo Especialidade')),
  descricao TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
  valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (valor_unitario >= 0),
  valor_total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  ramo TEXT NOT NULL CHECK (ramo IN ('Lobinho', 'Escoteiro', 'Sênior', 'Pioneiro', 'Jovens', 'Escotista', 'Todos')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an inventory management system)
CREATE POLICY "Anyone can view inventory items" 
ON public.inventory_items 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create inventory items" 
ON public.inventory_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update inventory items" 
ON public.inventory_items 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete inventory items" 
ON public.inventory_items 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.inventory_items (nivel, tipo, descricao, quantidade, valor_unitario, ramo) VALUES
  ('Nivel 1', 'Distintivo', 'Distintivo Escoteiro', 25, 12.50, 'Escoteiro'),
  ('Nivel 2', 'Certificado', 'Certificado de Progressão', 15, 8.00, 'Sênior'),
  ('Não Tem', 'Arganel', 'Arganel Dourado', 10, 15.00, 'Pioneiro'),
  ('Nivel 3', 'Distintivo Especialidade', 'Distintivo Comunicação', 30, 5.50, 'Jovens'),
  ('Nivel 1', 'Distintivo de Progressão', 'Distintivo Lobinho Saltador', 20, 7.25, 'Lobinho');