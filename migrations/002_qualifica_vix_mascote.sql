-- Somente para quem mantém a alternativa PostgreSQL.
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS mascote_id VARCHAR(40);
