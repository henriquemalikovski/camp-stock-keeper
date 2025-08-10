-- Update existing records with the new type name
UPDATE inventory_items 
SET tipo = 'Distintivo de Especialidade' 
WHERE tipo = 'Distintivo Especialidade';