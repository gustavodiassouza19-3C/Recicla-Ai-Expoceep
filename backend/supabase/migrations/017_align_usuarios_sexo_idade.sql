-- Alinha public.usuarios com o schema do repo (000_base_schema.sql).
-- A migration 004_add_usuario_sexo_idade.sql nunca foi aplicada no banco,
-- portanto sexo/idade seguiam ausentes em public.usuarios.

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'usuarios'
          AND column_name = 'sexo'
    ) THEN
        ALTER TABLE public.usuarios ADD COLUMN sexo VARCHAR(20);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'usuarios'
          AND column_name = 'idade'
    ) THEN
        ALTER TABLE public.usuarios ADD COLUMN idade INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'usuarios_idade_check'
          AND conrelid = 'public.usuarios'::regclass
    ) THEN
        ALTER TABLE public.usuarios
            ADD CONSTRAINT usuarios_idade_check
            CHECK (idade IS NULL OR idade BETWEEN 0 AND 120);
    END IF;
END $$;
