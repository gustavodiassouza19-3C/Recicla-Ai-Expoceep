-- Configuracao global editavel pelo painel admin.
--
-- Nao existia nenhuma tabela de configuracao no banco. A alternativa (env var
-- em app/config.py) exigiria redeploy a cada mudanca, e o requisito e o admin
-- colar o link pelo proprio painel. A escrita passa pelo backend com a service
-- key, que ignora RLS -- mesmo caminho usado por catalogo_recompensas.

CREATE TABLE IF NOT EXISTS public.site_config (
    chave         text PRIMARY KEY,
    valor         text NOT NULL DEFAULT '',
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.site_config IS
    'Pares chave/valor de configuracao global do site.';

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Leitura livre: o dashboard do usuario precisa do link, mas nao pode escrever.
DROP POLICY IF EXISTS site_config_select_public ON public.site_config;
CREATE POLICY site_config_select_public ON public.site_config
    FOR SELECT TO anon, authenticated USING (true);

-- Sem policy de INSERT/UPDATE/DELETE: so o backend escreve.

-- Link do formulario de votacao. Valor vazio = banner escondido no dashboard.
INSERT INTO public.site_config (chave, valor)
VALUES ('link_votacao', '')
ON CONFLICT (chave) DO NOTHING;
