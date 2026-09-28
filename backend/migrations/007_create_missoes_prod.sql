-- Recicla Ai — recria tabelas de missoes no Supabase de producao
-- As tabelas `missoes` e `missoes_usuario` nao existem em prod (erro PGRST205).
-- Rodar UMA VEZ no Supabase Dashboard > SQL Editor. Idempotente: pode rodar de novo sem duplicar.

CREATE TABLE IF NOT EXISTS missoes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    meta INTEGER NOT NULL,
    recompensa_pontos INTEGER NOT NULL DEFAULT 0,
    ativa BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS missoes_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    missao_id INTEGER NOT NULL REFERENCES missoes(id) ON DELETE CASCADE,
    progresso INTEGER NOT NULL DEFAULT 0,
    concluida BOOLEAN DEFAULT false,
    concluida_em TIMESTAMPTZ,
    UNIQUE(usuario_id, missao_id)
);

CREATE INDEX IF NOT EXISTS idx_missoes_usuario_user ON missoes_usuario(usuario_id);

-- Seeds: so insere se a tabela estiver vazia (nao duplica em re-execucao)
INSERT INTO missoes (titulo, descricao, meta, recompensa_pontos)
SELECT v.titulo, v.descricao, v.meta, v.recompensa_pontos
FROM (VALUES
    ('Recicle 5 vezes este mês', 'Entregue 5 sacolas recicláveis este mês', 5, 50),
    ('Use 3 tags diferentes', 'Vincule e use 3 tags NFC diferentes', 3, 30),
    ('Primeira entrega do mês', 'Faça sua primeira reciclagem do mês', 1, 20),
    ('Reciclador semanal', 'Recicle pelo menos 1 vez por semana durante 4 semanas', 4, 100),
    ('Maratonista verde', 'Valide 10 tags em um único mês', 10, 200)
) AS v(titulo, descricao, meta, recompensa_pontos)
WHERE NOT EXISTS (SELECT 1 FROM missoes);

-- Conferencia (esperado: 5 linhas em missoes)
SELECT COUNT(*) AS total_missoes FROM missoes;
