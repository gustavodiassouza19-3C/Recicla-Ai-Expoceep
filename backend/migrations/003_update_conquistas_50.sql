-- Substitui as conquistas antigas (41) pelas novas (50) sem emojis
-- Execute no Supabase SQL Editor

-- Limpar conquistas antigas e usuario_conquistas
DELETE FROM usuario_conquistas;
DELETE FROM conquistas;

-- Inserir as 50 conquistas
INSERT INTO conquistas (codigo, nome, descricao, icone, pontos, categoria, condicao_tipo, condicao_valor) VALUES
-- Contagem de TAGs (1-10)
('primeiro_passo', 'Primeiro Passo', 'Primeira TAG validada', 'P', 50, 'tags', 'total_tags', 1),
('comecando_a_reciclar', 'Comecando a Reciclar', '2 TAGs validadas', 'R', 30, 'tags', 'total_tags', 2),
('de_volta_ao_ciclo', 'De Volta ao Ciclo', '3 TAGs validadas', 'V', 50, 'tags', 'total_tags', 3),
('consciencia_verde', 'Consciencia Verde', '5 TAGs validadas', 'C', 100, 'tags', 'total_tags', 5),
('ritmo_verde', 'Ritmo Verde', '10 TAGs validadas', 'RV', 200, 'tags', 'total_tags', 10),
('reciclador_ativo', 'Reciclador Ativo', '15 TAGs validadas', 'RA', 300, 'tags', 'total_tags', 15),
('impacto_local', 'Impacto Local', '20 TAGs validadas', 'IL', 400, 'tags', 'total_tags', 20),
('compromisso_verde', 'Compromisso Verde', '30 TAGs validadas', 'CV', 600, 'tags', 'total_tags', 30),
('agente_ambiental', 'Agente Ambiental', '50 TAGs validadas', 'AA', 1000, 'tags', 'total_tags', 50),
('embaixador_da_reciclagem', 'Embaixador da Reciclagem', '100 TAGs validadas', 'ER', 2000, 'tags', 'total_tags', 100),

-- Sequencias consecutivas (11-15)
('primeira_sequencia', 'Primeira Sequencia', '2 participacoes consecutivas', 'S', 50, 'sequencia', 'sequencia_dias', 2),
('sem_parar', 'Sem Parar', '3 participacoes consecutivas', 'SP', 75, 'sequencia', 'sequencia_dias', 3),
('constancia_verde', 'Constancia Verde', '5 participacoes consecutivas', 'CV', 150, 'sequencia', 'sequencia_dias', 5),
('ritmo_sustentavel', 'Ritmo Sustentavel', '10 participacoes consecutivas', 'RS', 300, 'sequencia', 'sequencia_dias', 10),
('imparavel', 'Imparavel', '20 participacoes consecutivas', 'IM', 700, 'sequencia', 'sequencia_dias', 20),

-- Periodos de tempo (16-21)
('semana_verde', 'Semana Verde', 'Participar em 1 semana', 'SV', 50, 'periodo', 'semanas_consecutivas', 1),
('duas_semanas', 'Duas Semanas', 'Participar em 2 semanas consecutivas', 'DS', 100, 'periodo', 'semanas_consecutivas', 2),
('mes_sustentavel', 'Mes Sustentavel', 'Participar durante 1 mes', 'MS', 200, 'periodo', 'meses_consecutivos', 1),
('dois_meses_verdes', 'Dois Meses Verdes', 'Participar durante 2 meses consecutivos', 'DM', 400, 'periodo', 'meses_consecutivos', 2),
('trimestre_sustentavel', 'Trimestre Sustentavel', 'Participar durante 3 meses consecutivos', 'TS', 700, 'periodo', 'meses_consecutivos', 3),
('seis_meses_compromisso', 'Seis Meses de Compromisso', 'Participar durante 6 meses consecutivos', 'SC', 1500, 'periodo', 'meses_consecutivos', 6),

-- Contagem de TAGs - Casa (22-25)
('casa_sustentavel', 'Casa Sustentavel', '5 TAGs validadas em casa', 'CS', 100, 'tags_casa', 'total_tags', 5),
('rotina_verde', 'Rotina Verde', '10 TAGs validadas em casa', 'RV', 200, 'tags_casa', 'total_tags', 10),
('habito_sustentavel', 'Habito Sustentavel', '25 TAGs validadas em casa', 'HS', 500, 'tags_casa', 'total_tags', 25),
('estilo_de_vida_verde', 'Estilo de Vida Verde', '50 TAGs validadas em casa', 'EV', 1000, 'tags_casa', 'total_tags', 50),

-- Marcos de pontos (26-30)
('primeira_meta', 'Primeira Meta', 'Alcancar 500 pontos', 'PM', 50, 'pontos', 'total_pontos', 500),
('mil_pontos', 'Mil Pontos', 'Alcancar 1.000 pontos', 'MP', 100, 'pontos', 'total_pontos', 1000),
('dois_mil', 'Dois Mil', 'Alcancar 2.000 pontos', 'DM', 200, 'pontos', 'total_pontos', 2000),
('cinco_mil', 'Cinco Mil', 'Alcancar 5.000 pontos', 'CM', 500, 'pontos', 'total_pontos', 5000),
('dez_mil', 'Dez Mil', 'Alcancar 10.000 pontos', 'ZM', 1000, 'pontos', 'total_pontos', 10000),

-- Frequencia/velocidade (31-35)
('comeco_rapido', 'Comeco Rapido', 'Validar 3 TAGs em pouco tempo', 'CR', 100, 'frequencia', 'tags_rapidas', 3),
('alta_frequencia', 'Alta Frequencia', 'Validar 5 TAGs em um periodo curto', 'AF', 200, 'frequencia', 'alta_frequencia', 5),
('semana_perfeita', 'Semana Perfeita', 'Participacao valida em todos os dias possiveis da semana', 'SP', 150, 'frequencia', 'semana_perfeita', 7),
('em_evolucao', 'Em Evolucao', 'Aumentar sua frequencia de participacao', 'EE', 100, 'frequencia', 'em_evolucao', 1),
('novo_ritmo', 'Novo Ritmo', 'Aumentar a frequencia por 2 periodos consecutivos', 'NR', 200, 'frequencia', 'novo_ritmo', 2),

-- Compromisso/manutencao (36-41)
('compromisso_mantido', 'Compromisso Mantido', 'Nao interromper uma sequencia durante o periodo definido', 'CM', 150, 'compromisso', 'compromisso_mantido', 1),
('primeiro_mes', 'Primeiro Mes', 'Completar o primeiro mes de participacao', 'PM', 250, 'compromisso', 'meses_participacao', 1),
('tres_meses_verdes', 'Tres Meses Verdes', 'Completar 3 meses de participacao', 'TM', 500, 'compromisso', 'meses_participacao', 3),
('seis_meses_verdes', 'Seis Meses Verdes', 'Completar 6 meses de participacao', 'SM', 1000, 'compromisso', 'meses_participacao', 6),
('veterano_verde', 'Veterano Verde', 'Completar 1 ano de participacao', 'VV', 2000, 'compromisso', 'meses_participacao', 12),
('dez_participacoes', '10 Participacoes', '10 participacoes validadas', 'DP', 150, 'compromisso', 'total_participacoes', 10),

-- Total de participacoes (42-45)
('vinte_cinco_participacoes', '25 Participacoes', '25 participacoes validadas', 'VC', 350, 'compromisso', 'total_participacoes', 25),
('cinquenta_participacoes', '50 Participacoes', '50 participacoes validadas', 'CP', 750, 'compromisso', 'total_participacoes', 50),
('setenta_cinco_participacoes', '75 Participacoes', '75 participacoes validadas', 'SC', 1200, 'compromisso', 'total_participacoes', 75),
('cem_participacoes', '100 Participacoes', '100 participacoes validadas', '100', 2000, 'compromisso', 'total_participacoes', 100),

-- Meta-conquistas: completar outras conquistas (46-50)
('reciclador_bronze', 'Reciclador Bronze', 'Completar 5 conquistas', 'RB', 100, 'meta', 'total_conquistas', 5),
('reciclador_prata', 'Reciclador Prata', 'Completar 15 conquistas', 'RP', 300, 'meta', 'total_conquistas', 15),
('reciclador_ouro', 'Reciclador Ouro', 'Completar 30 conquistas', 'RO', 750, 'meta', 'total_conquistas', 30),
('reciclador_diamante', 'Reciclador Diamante', 'Completar 40 conquistas', 'RD', 1500, 'meta', 'total_conquistas', 40),
('lenda_verde', 'Lenda Verde', 'Completar todas as conquistas', 'LV', 3000, 'meta', 'total_conquistas', 50)
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    pontos = EXCLUDED.pontos,
    categoria = EXCLUDED.categoria,
    condicao_tipo = EXCLUDED.condicao_tipo,
    condicao_valor = EXCLUDED.condicao_valor;
