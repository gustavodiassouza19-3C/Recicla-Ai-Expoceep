-- public.usuarios.tipo passa a aceitar apenas 'cliente' e 'admin'.
--
-- O app so escreve dois valores: 'cliente' no registro (auth.py:107 e
-- users.py:48) e 'admin' na criacao de administrador (admin_service.py:87).
-- O schema base (000_base_schema.sql:13) ainda aceitava 'funcionario' e
-- 'administrador', e a tabela chegou a conter 'cidadao' -- valor que nenhuma
-- das constraints permitiria, o que indica drift entre o schema versionado e
-- o banco hospedado.

-- 1. Dado: qualquer valor fora do par vira 'cliente'. Nunca promove a admin.
UPDATE public.usuarios
   SET tipo = 'cliente'
 WHERE tipo NOT IN ('cliente', 'admin');

-- 2. Recria a constraint no par restrito, sem falhar se ela nao existir.
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'usuarios_tipo_check'
          AND conrelid = 'public.usuarios'::regclass
    ) THEN
        ALTER TABLE public.usuarios DROP CONSTRAINT usuarios_tipo_check;
    END IF;
END $$;

ALTER TABLE public.usuarios
    ADD CONSTRAINT usuarios_tipo_check CHECK (tipo IN ('cliente', 'admin'));
