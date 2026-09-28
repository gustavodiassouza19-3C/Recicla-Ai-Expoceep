-- ============================================================
-- Migration 008: Correcoes de seguranca
-- Aplicado via MCP em 2026-09-19
-- ============================================================

DO $$
BEGIN
    IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO postgres';
    END IF;
END $$;
