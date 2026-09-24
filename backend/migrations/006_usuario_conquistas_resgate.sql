-- Conquistas desbloqueadas ficam pendentes de resgate ate resgatada_em ser preenchido
-- Execute no Supabase SQL Editor

ALTER TABLE usuario_conquistas
    ADD COLUMN IF NOT EXISTS resgatada_em TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_usuario_conquistas_pendentes
    ON usuario_conquistas(usuario_id)
    WHERE resgatada_em IS NULL;
