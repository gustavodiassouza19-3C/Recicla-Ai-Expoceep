-- ============================================================
-- Migration 008: Correcoes de seguranca
-- Aplicado via MCP em 2026-09-19
-- ============================================================

-- Revogar EXECUTE da funcao rls_auto_enable para roles publicas
-- Essa funcao e SECURITY DEFINER e nao deveria ser acessivel
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO postgres;
