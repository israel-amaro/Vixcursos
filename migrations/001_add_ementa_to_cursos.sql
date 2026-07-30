-- Migração safe para adicionar campo ementa na tabela cursos e popular com competencias
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS ementa TEXT NULL;

-- Preenche ementa com competencias se ementa estiver vazia ou nula
UPDATE cursos 
SET ementa = competencias 
WHERE (ementa IS NULL OR ementa = '') AND competencias IS NOT NULL AND competencias != '';
