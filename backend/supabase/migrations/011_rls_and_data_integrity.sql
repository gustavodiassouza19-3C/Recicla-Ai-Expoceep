UPDATE tags SET status = 'disponivel' WHERE status = 'ativa';
UPDATE reciclagens SET status = 'pendente' WHERE status = 'registrada';

ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_status_check;
ALTER TABLE tags ADD CONSTRAINT tags_status_check CHECK (status IN ('disponivel', 'em_uso', 'indisponivel'));

ALTER TABLE reciclagens DROP CONSTRAINT IF EXISTS reciclagens_status_check;
ALTER TABLE reciclagens ADD CONSTRAINT reciclagens_status_check CHECK (status IN ('pendente', 'validada', 'rejeitada'));

ALTER TABLE recompensas ADD COLUMN IF NOT EXISTS data_liberacao TIMESTAMPTZ;
ALTER TABLE recompensas ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE;
UPDATE recompensas r
SET usuario_id = rec.usuario_id
FROM reciclagens rec
WHERE r.reciclagem_id = rec.id
  AND r.usuario_id IS NULL;

UPDATE recompensas rew
SET status = 'cancelada'
FROM reciclagens rec
WHERE rew.reciclagem_id = rec.id
  AND rec.status <> 'validada'
  AND rew.status = 'liberada';

ALTER TABLE recompensas ADD COLUMN IF NOT EXISTS missao_id INTEGER REFERENCES missoes(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_recompensas_usuario_missao
ON recompensas(usuario_id, missao_id)
WHERE missao_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_current_usuario_id()
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id
    FROM usuarios
    WHERE lower(email) = lower(auth.jwt() ->> 'email')
    LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_current_usuario_id() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_current_usuario_id() TO authenticated;

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE reciclagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE recompensas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_pontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE missoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE missoes_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS usuarios_select_own ON usuarios;
DROP POLICY IF EXISTS usuarios_update_own ON usuarios;
DROP POLICY IF EXISTS usuarios_insert_auth ON usuarios;
CREATE POLICY usuarios_select_own ON usuarios FOR SELECT TO authenticated
USING (id = public.get_current_usuario_id());
CREATE POLICY usuarios_update_own ON usuarios FOR UPDATE TO authenticated
USING (id = public.get_current_usuario_id())
WITH CHECK (id = public.get_current_usuario_id());

REVOKE UPDATE ON usuarios FROM authenticated;
GRANT UPDATE (nome, cpf, sexo, idade, household_size) ON usuarios TO authenticated;

DROP POLICY IF EXISTS tags_select_authenticated ON tags;
DROP POLICY IF EXISTS tags_select_anon ON tags;
CREATE POLICY tags_select_available ON tags FOR SELECT TO anon, authenticated
USING (status = 'disponivel');

DROP POLICY IF EXISTS reciclagens_select_own ON reciclagens;
DROP POLICY IF EXISTS reciclagens_insert_own ON reciclagens;
CREATE POLICY reciclagens_select_own ON reciclagens FOR SELECT TO authenticated
USING (usuario_id = public.get_current_usuario_id());

DROP POLICY IF EXISTS recompensas_select_own ON recompensas;
CREATE POLICY recompensas_select_own ON recompensas FOR SELECT TO authenticated
USING (
    usuario_id = public.get_current_usuario_id()
    OR reciclagem_id IN (
        SELECT id FROM reciclagens
        WHERE usuario_id = public.get_current_usuario_id()
    )
);

DROP POLICY IF EXISTS conquistas_select_public ON conquistas;
DROP POLICY IF EXISTS conquistas_select_auth ON conquistas;
CREATE POLICY conquistas_select_public ON conquistas FOR SELECT TO anon, authenticated
USING (ativa = true);

DROP POLICY IF EXISTS usuario_conquistas_select_own ON usuario_conquistas;
CREATE POLICY usuario_conquistas_select_own ON usuario_conquistas FOR SELECT TO authenticated
USING (usuario_id = public.get_current_usuario_id());

DROP POLICY IF EXISTS eco_pontos_select_public ON eco_pontos;
DROP POLICY IF EXISTS eco_pontos_select_auth ON eco_pontos;
CREATE POLICY eco_pontos_select_public ON eco_pontos FOR SELECT TO anon, authenticated
USING (status = 'aberto' OR status IS NULL);

DROP POLICY IF EXISTS missoes_select_public ON missoes;
DROP POLICY IF EXISTS missoes_select_auth ON missoes;
CREATE POLICY missoes_select_public ON missoes FOR SELECT TO anon, authenticated
USING (ativa = true);

DROP POLICY IF EXISTS missoes_usuario_select_own ON missoes_usuario;
DROP POLICY IF EXISTS missoes_usuario_insert_own ON missoes_usuario;
DROP POLICY IF EXISTS missoes_usuario_update_own ON missoes_usuario;
CREATE POLICY missoes_usuario_select_own ON missoes_usuario FOR SELECT TO authenticated
USING (usuario_id = public.get_current_usuario_id());
