-- Tags ficticias com codigos de 5 caracteres
-- Execute no Supabase SQL Editor

-- Inserir 10 tags NFC ficticias
INSERT INTO tags (codigo_nfc, status) VALUES
('A1B2C', 'ativa'),
('D3E4F', 'ativa'),
('G5H6I', 'em_uso'),
('J7K8L', 'ativa'),
('M9N0P', 'ativa'),
('Q1R2S', 'ativa'),
('T3U4V', 'ativa'),
('W5X6Y', 'ativa'),
('Z7A8B', 'ativa'),
('C9D0E', 'ativa')
ON CONFLICT (codigo_nfc) DO NOTHING;

-- Inserir reciclagens ficticias para o usuario 1
-- (ajuste o usuario_id se necessario)
WITH tag_ids AS (
    SELECT id, codigo_nfc FROM tags WHERE codigo_nfc IN (
        'A1B2C', 'D3E4F', 'G5H6I', 'J7K8L', 'M9N0P',
        'Q1R2S', 'T3U4V', 'W5X6Y', 'Z7A8B', 'C9D0E'
    )
),
user_recicl AS (
    INSERT INTO reciclagens (usuario_id, tag_id, data_entrega, status)
    SELECT
        1,
        t.id,
        v.data_entrega,
        v.status
    FROM (VALUES
        ('A1B2C', '2026-08-01T14:30:00+00:00', 'validada'),
        ('D3E4F', '2026-08-05T10:15:00+00:00', 'validada'),
        ('G5H6I', '2026-08-10T16:45:00+00:00', 'validada'),
        ('J7K8L', '2026-08-15T09:20:00+00:00', 'validada'),
        ('M9N0P', '2026-08-20T11:00:00+00:00', 'validada'),
        ('Q1R2S', '2026-08-25T15:30:00+00:00', 'validada'),
        ('T3U4V', '2026-09-01T13:45:00+00:00', 'validada'),
        ('W5X6Y', '2026-09-05T10:30:00+00:00', 'validada'),
        ('Z7A8B', '2026-09-10T14:00:00+00:00', 'validada'),
        ('C9D0E', '2026-09-15T16:15:00+00:00', 'validada')
    ) AS v(codigo, data_entrega, status)
    JOIN tag_ids t ON t.codigo_nfc = v.codigo
    RETURNING id
)
-- Inserir recompensas (pontos) para cada reciclagem
INSERT INTO recompensas (reciclagem_id, tipo, valor, status)
SELECT id, 'pontos', 10, 'liberada' FROM user_recicl;

-- Atualizar pontos do usuario 1
UPDATE usuarios SET pontos = (
    SELECT COALESCE(SUM(valor), 0)
    FROM recompensas
    WHERE tipo = 'pontos' AND status = 'liberada'
    AND reciclagem_id IN (
        SELECT id FROM reciclagens WHERE usuario_id = 1
    )
) WHERE id = 1;
