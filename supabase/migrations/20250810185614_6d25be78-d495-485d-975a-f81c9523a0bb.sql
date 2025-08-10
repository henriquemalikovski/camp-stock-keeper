-- Add 'Cordão' as a valid tipo option
-- Since we're using text fields, no enum constraint to modify
-- Just document the new valid option for reference

-- Add a comment to document valid tipo values including the new 'Cordão'
COMMENT ON COLUMN public.inventory_items.tipo IS 'Valid values: Arganel, Certificado, Distintivo, Distintivo de Progressão, Distintivo de Especialidade, Cordão';