-- Adicionar colunas sexo e idade a tabela de usuarios
-- Execute no Supabase SQL Editor

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'sexo'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN sexo VARCHAR(20);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'idade'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN idade INTEGER;
    END IF;
END $$;