-- ============================================================
-- Migration 004: Adicionar coluna pontos + sincronizar dados
-- Aplicado via MCP em 2026-09-19
-- ============================================================

-- 1. Adicionar coluna pontos na tabela usuarios
-- O backend ja calcula isso dinamicamente, mas o frontend espera vir do banco
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS pontos INTEGER NOT NULL DEFAULT 0;

-- 2. Sincronizar pontos existentes baseado em recompensas liberadas
UPDATE usuarios SET pontos = (
    SELECT COALESCE(SUM(r.valor), 0)
    FROM recompensas r
    JOIN reciclagens rec ON r.reciclagem_id = rec.id
    WHERE rec.usuario_id = usuarios.id
      AND r.tipo = 'pontos'
      AND r.status = 'liberada'
);
