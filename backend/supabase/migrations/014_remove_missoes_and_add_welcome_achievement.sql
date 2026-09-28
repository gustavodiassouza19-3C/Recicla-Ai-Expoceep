DROP TABLE IF EXISTS public.missoes_usuario;
DROP TABLE IF EXISTS public.missoes;

INSERT INTO public.conquistas (
    codigo,
    nome,
    descricao,
    icone,
    pontos,
    categoria,
    condicao_tipo,
    condicao_valor,
    ativa
)
VALUES (
    'boas_vindas',
    'Boas-vindas',
    'Você criou sua conta e começou sua jornada de reciclagem.',
    '🎉',
    100,
    'boas_vindas',
    'cadastro',
    1,
    true
)
ON CONFLICT (codigo) DO UPDATE SET
    nome = EXCLUDED.nome,
    descricao = EXCLUDED.descricao,
    icone = EXCLUDED.icone,
    pontos = EXCLUDED.pontos,
    categoria = EXCLUDED.categoria,
    condicao_tipo = EXCLUDED.condicao_tipo,
    condicao_valor = EXCLUDED.condicao_valor,
    ativa = EXCLUDED.ativa;
