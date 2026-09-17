-- Tabela de eco-pontos (locais de coleta)
-- Execute no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS eco_pontos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    endereco TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) DEFAULT 'aberto',
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eco_pontos_coords ON eco_pontos(lat, lng);

-- Tabela de missoes
CREATE TABLE IF NOT EXISTS missoes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    meta INTEGER NOT NULL,
    recompensa_pontos INTEGER NOT NULL DEFAULT 0,
    ativa BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Progresso de missoes por usuario
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

-- Seeds: eco-pontos de Cascavel/PR
INSERT INTO eco_pontos (nome, endereco, lat, lng) VALUES
('Ecoponto Quebec', 'Rua Aparecida dos Portos, 2095 – Jardim Quebec/Guarujá, Cascavel/PR', -24.9520, -53.4620),
('Ecoponto Santa Cruz', 'Rua Tupinambás, 1400 – Santa Cruz, Cascavel/PR', -24.9610, -53.4490),
('Ecoponto Cascavel Velho', 'Rua Hermes da Fonseca, 2100 – Cascavel Velho, Cascavel/PR', -24.9480, -53.4480),
('Ecoponto Melissa', 'Rua Hibiscos, 225 – Brasmadeira, Cascavel/PR', -24.9650, -53.4580),
('Ecoponto Brasília', 'Rua Noel Rosa, 52 – Jardim Brasília, Cascavel/PR', -24.9580, -53.4650),
('Ecoponto Manaus', 'Rua Manaus, 1524 – Country, Cascavel/PR', -24.9500, -53.4520)
ON CONFLICT DO NOTHING;

-- Seeds: missoes iniciais
INSERT INTO missoes (titulo, descricao, meta, recompensa_pontos) VALUES
('Recicle 5 vezes este mês', 'Entregue 5 sacolas recicláveis este mês', 5, 50),
('Use 3 tags diferentes', 'Vincule e use 3 tags NFC diferentes', 3, 30),
('Primeira entrega do mês', 'Faça sua primeira reciclagem do mês', 1, 20),
('Reciclador semanal', 'Recicle pelo menos 1 vez por semana durante 4 semanas', 4, 100),
('Maratonista verde', 'Valide 10 tags em um único mês', 10, 200)
ON CONFLICT DO NOTHING;
