-- Tabela de conquistas do sistema de gamificação
-- Execute no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS conquistas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    icone VARCHAR(10) NOT NULL,
    pontos INTEGER NOT NULL DEFAULT 0,
    categoria VARCHAR(30) NOT NULL,
    condicao_tipo VARCHAR(30) NOT NULL,
    condicao_valor INTEGER NOT NULL,
    ativa BOOLEAN DEFAULT true,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuario_conquistas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    conquista_id INTEGER NOT NULL REFERENCES conquistas(id) ON DELETE CASCADE,
    conquista_codigo VARCHAR(50) NOT NULL,
    pontos_ganhos INTEGER NOT NULL DEFAULT 0,
    concedida_em TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, conquista_codigo)
);

CREATE INDEX IF NOT EXISTS idx_usuario_conquistas_usuario ON usuario_conquistas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuario_conquistas_codigo ON usuario_conquistas(conquista_codigo);

-- Insert das 41 conquistas
INSERT INTO conquistas (codigo, nome, descricao, icone, pontos, categoria, condicao_tipo, condicao_valor) VALUES
-- Contagem de TAGs (#1-#10)
('primeiro_passo', 'Primeiro Passo', 'Primeira TAG validada', '🌱', 50, 'tags', 'total_tags', 1),
('comecando_a_reciclar', 'Comecando a Reciclar', '2 TAGs validadas', '♻️', 30, 'tags', 'total_tags', 2),
('de_volta_ao_ciclo', 'De Volta ao Ciclo', '3 TAGs validadas', '🔄', 50, 'tags', 'total_tags', 3),
('consciencia_verde', 'Consciência Verde', '5 TAGs validadas', '🌿', 100, 'tags', 'total_tags', 5),
('ritmo_verde', 'Ritmo Verde', '10 TAGs validadas', '🚀', 200, 'tags', 'total_tags', 10),
('reciclador_ativo', 'Reciclador Ativo', '15 TAGs validadas', '🏅', 300, 'tags', 'total_tags', 15),
('impacto_local', 'Impacto Local', '20 TAGs validadas', '🌎', 400, 'tags', 'total_tags', 20),
('compromisso_verde', 'Compromisso Verde', '30 TAGs validadas', '💚', 600, 'tags', 'total_tags', 30),
('agente_ambiental', 'Agente Ambiental', '50 TAGs validadas', '🌳', 1000, 'tags', 'total_tags', 50),
('embaixador_da_reciclagem', 'Embaixador da Reciclagem', '100 TAGs validadas', '🏆', 2000, 'tags', 'total_tags', 100),

-- Sequências consecutivas (#11-#15)
('primeira_sequencia', 'Primeira Sequência', '2 participações consecutivas', '🔥', 50, 'sequencia', 'sequencia_dias', 2),
('sem_parar', 'Sem Parar', '3 participações consecutivas', '🔥', 75, 'sequencia', 'sequencia_dias', 3),
('constancia_verde', 'Constância Verde', '5 participações consecutivas', '🔥', 150, 'sequencia', 'sequencia_dias', 5),
('ritmo_sustentavel', 'Ritmo Sustentável', '10 participações consecutivas', '🔥', 300, 'sequencia', 'sequencia_dias', 10),
('imparavel', 'Imparável', '20 participações consecutivas', '🔥', 700, 'sequencia', 'sequencia_dias', 20),

-- Períodos de tempo (#16-#21)
('semana_verde', 'Semana Verde', 'Participar em 1 semana', '📅', 50, 'periodo', 'semanas_consecutivas', 1),
('duas_semanas', 'Duas Semanas', 'Participar em 2 semanas consecutivas', '📅', 100, 'periodo', 'semanas_consecutivas', 2),
('mes_sustentavel', 'Mês Sustentável', 'Participar durante 1 mês', '📅', 200, 'periodo', 'meses_consecutivos', 1),
('dois_meses_verdes', 'Dois Meses Verdes', 'Participar durante 2 meses consecutivos', '📅', 400, 'periodo', 'meses_consecutivos', 2),
('trimestre_sustentavel', 'Trimestre Sustentável', 'Participar durante 3 meses consecutivos', '📅', 700, 'periodo', 'meses_consecutivos', 3),
('seis_meses_compromisso', 'Seis Meses de Compromisso', 'Participar durante 6 meses consecutivos', '🗓️', 1500, 'periodo', 'meses_consecutivos', 6),

-- Contagem de TAGs - Casa (#22-#25)
('casa_sustentavel', 'Casa Sustentável', '5 TAGs validadas', '🏠', 100, 'tags_casa', 'total_tags', 5),
('rotina_verde', 'Rotina Verde', '10 TAGs validadas', '🏠', 200, 'tags_casa', 'total_tags', 10),
('habito_sustentavel', 'Hábito Sustentável', '25 TAGs validadas', '🏠', 500, 'tags_casa', 'total_tags', 25),
('estilo_de_vida_verde', 'Estilo de Vida Verde', '50 TAGs validadas', '🏠', 1000, 'tags_casa', 'total_tags', 50),

-- Marcos de pontos (#26-#30)
('primeira_meta', 'Primeira Meta', 'Alcançar 500 pontos', '🎯', 50, 'pontos', 'total_pontos', 500),
('mil_pontos', 'Mil Pontos', 'Alcançar 1.000 pontos', '🎯', 100, 'pontos', 'total_pontos', 1000),
('dois_mil', 'Dois Mil', 'Alcançar 2.000 pontos', '🎯', 200, 'pontos', 'total_pontos', 2000),
('cinco_mil', 'Cinco Mil', 'Alcançar 5.000 pontos', '🎯', 500, 'pontos', 'total_pontos', 5000),
('dez_mil', 'Dez Mil', 'Alcançar 10.000 pontos', '🎯', 1000, 'pontos', 'total_pontos', 10000),

-- Frequência/velocidade (#31-#35)
('comeco_rapido', 'Começo Rápido', 'Validar 3 TAGs em pouco tempo', '⚡', 100, 'frequencia', 'tags_rapidas', 3),
('alta_frequencia', 'Alta Frequência', 'Validar 5 TAGs em período curto', '⚡', 200, 'frequencia', 'alta_frequencia', 5),
('semana_perfeita', 'Semana Perfeita', 'Participação válida em todos os dias da semana', '⚡', 150, 'frequencia', 'semana_perfeita', 7),
('em_evolucao', 'Em Evolução', 'Aumentar frequência de participação', '📈', 100, 'frequencia', 'em_evolucao', 1),
('novo_ritmo', 'Novo Ritmo', 'Aumentar frequência por 2 períodos consecutivos', '📈', 200, 'frequencia', 'novo_ritmo', 2),

-- Compromisso/maintained (#36-#41)
('compromisso_mantido', 'Compromisso Mantido', 'Não interromper sequência durante período definido', '🔒', 150, 'compromisso', 'compromisso_mantido', 1),
('primeiro_mes', 'Primeiro Mês', 'Completar primeiro mês de participação', '🌱', 250, 'compromisso', 'meses_participacao', 1),
('tres_meses_verdes', 'Três Meses Verdes', 'Completar 3 meses de participação', '🌱', 500, 'compromisso', 'meses_participacao', 3),
('seis_meses_verdes', 'Seis Meses Verdes', 'Completar 6 meses de participação', '🌱', 1000, 'compromisso', 'meses_participacao', 6),
('veterano_verde', 'Veterano Verde', 'Completar 1 ano de participação', '🏆', 2000, 'compromisso', 'meses_participacao', 12),
('dez_participacoes', '10 Participações', '10 participações', '♻️', 100, 'compromisso', 'total_participacoes', 10)
ON CONFLICT (codigo) DO NOTHING;
