-- ============================================================
-- Migration 006: Politicas RLS para todas as 9 tabelas
-- Aplicado via MCP em 2026-09-19
-- ============================================================

-- =============================================
-- 1. USUARIOS
-- =============================================
CREATE POLICY "usuarios_select_own"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth.uid()::text = email);

CREATE POLICY "usuarios_update_own"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = email)
  WITH CHECK (auth.uid()::text = email);

CREATE POLICY "usuarios_insert_auth"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- 2. TAGS
-- =============================================
CREATE POLICY "tags_select_authenticated"
  ON tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "tags_select_anon"
  ON tags FOR SELECT
  TO anon
  USING (true);

-- =============================================
-- 3. RECICLAGENS
-- =============================================
CREATE POLICY "reciclagens_select_own"
  ON reciclagens FOR SELECT
  TO authenticated
  USING (usuario_id IN (
    SELECT id FROM usuarios WHERE email = auth.uid()::text
  ));

CREATE POLICY "reciclagens_insert_own"
  ON reciclagens FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id IN (
    SELECT id FROM usuarios WHERE email = auth.uid()::text
  ));

-- =============================================
-- 4. RECOMPENSAS
-- =============================================
CREATE POLICY "recompensas_select_own"
  ON recompensas FOR SELECT
  TO authenticated
  USING (reciclagem_id IN (
    SELECT r.id FROM reciclagens r
    JOIN usuarios u ON r.usuario_id = u.id
    WHERE u.email = auth.uid()::text
  ));

-- =============================================
-- 5. CONQUISTAS
-- =============================================
CREATE POLICY "conquistas_select_public"
  ON conquistas FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "conquistas_select_auth"
  ON conquistas FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- 6. USUARIO_CONQUISTAS
-- =============================================
CREATE POLICY "usuario_conquistas_select_own"
  ON usuario_conquistas FOR SELECT
  TO authenticated
  USING (usuario_id IN (
    SELECT id FROM usuarios WHERE email = auth.uid()::text
  ));

-- =============================================
-- 7. ECO_PONTOS
-- =============================================
CREATE POLICY "eco_pontos_select_public"
  ON eco_pontos FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "eco_pontos_select_auth"
  ON eco_pontos FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- 8. MISSOES
-- =============================================
CREATE POLICY "missoes_select_public"
  ON missoes FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "missoes_select_auth"
  ON missoes FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- 9. MISSOES_USUARIO
-- =============================================
CREATE POLICY "missoes_usuario_select_own"
  ON missoes_usuario FOR SELECT
  TO authenticated
  USING (usuario_id IN (
    SELECT id FROM usuarios WHERE email = auth.uid()::text
  ));

CREATE POLICY "missoes_usuario_insert_own"
  ON missoes_usuario FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id IN (
    SELECT id FROM usuarios WHERE email = auth.uid()::text
  ));

CREATE POLICY "missoes_usuario_update_own"
  ON missoes_usuario FOR UPDATE
  TO authenticated
  USING (usuario_id IN (
    SELECT id FROM usuarios WHERE email = auth.uid()::text
  ))
  WITH CHECK (usuario_id IN (
    SELECT id FROM usuarios WHERE email = auth.uid()::text
  ));
