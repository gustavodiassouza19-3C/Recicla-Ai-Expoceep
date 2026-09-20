-- ============================================================
-- Migration 005: Limpar missoes duplicadas
-- Aplicado via MCP em 2026-09-19
-- ============================================================

-- As missoes 6-10 sao duplicatas das 1-5 (mesmos dados sem acentos)
-- Removendo as duplicatas, mantendo as originais com acentos corretos
DELETE FROM missoes WHERE id IN (6, 7, 8, 9, 10);
