-- Migration: add_household_size_to_usuarios
-- Adiciona campo household_size na tabela usuarios para estimativa de impacto ambiental.

ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS household_size integer NOT NULL DEFAULT 1
CHECK (household_size >= 1);
