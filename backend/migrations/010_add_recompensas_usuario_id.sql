ALTER TABLE public.recompensas
    ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES public.usuarios(id) ON DELETE CASCADE;

UPDATE public.recompensas reward
SET usuario_id = recycling.usuario_id
FROM public.reciclagens recycling
WHERE reward.reciclagem_id = recycling.id
  AND reward.usuario_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_recompensas_usuario
    ON public.recompensas(usuario_id);
