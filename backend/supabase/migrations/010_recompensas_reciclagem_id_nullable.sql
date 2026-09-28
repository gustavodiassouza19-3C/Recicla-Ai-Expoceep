-- Migration: recompensas_reciclagem_id_nullable
-- Permite criar recompensas de missão sem vincular a uma reciclagem (reciclagem_id = NULL).
-- Idempotente: seguro para re-execução.

ALTER TABLE recompensas ALTER COLUMN reciclagem_id DROP NOT NULL;
