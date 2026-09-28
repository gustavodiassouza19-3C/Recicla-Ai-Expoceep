-- Recicla Ai — recompensas.reciclagem_id nullable
-- Rodar UMA VEZ no Supabase Dashboard (SQL Editor).
-- Permite criar recompensas de missão sem vincular a uma reciclagem (reciclagem_id = NULL).
-- Idempotente: seguro para re-execução.

ALTER TABLE recompensas ALTER COLUMN reciclagem_id DROP NOT NULL;
