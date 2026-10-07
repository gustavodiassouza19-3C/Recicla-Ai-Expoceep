# Expoceep — acesso externo e pendências de infraestrutura

## Status

A análise local e as correções de código foram concluídas. Não houve acesso ao Supabase remoto, à Vercel ou a um MCP de infraestrutura. Nenhuma migration remota, seed ou deploy foi executado.

`backend/.env` não existe neste ambiente. O frontend possui um `.env`, mas nenhum valor foi lido ou exposto.

## Correções locais concluídas

- Rotas administrativas protegidas por autenticação e perfil `admin`/`administrador`.
- Validação de tags protegida para `admin`, `administrador` ou `funcionario`.
- CORS sem origem curinga e sem credenciais combinadas incorretamente.
- Status canônico de tags normalizado para `disponivel`.
- Registro de reciclagem cria `pendente` e não libera recompensa antes da validação.
- Validação libera uma única recompensa e recalcula os pontos do usuário.
- Recompensas de missão usam `usuario_id` e `missao_id`, sem `reciclagem_id = 0`.
- Contratos de histórico, impacto, score e tags corrigidos; mocks removidos das API routes.
- API routes internas repassam o token do usuário ao backend.
- Cadastro e perfil recuperam o `usuario_id` do backend/Supabase.
- Atualização de perfil não altera `tipo`, `pontos`, `email` ou `senha`.
- Schema base local, seed configurado e migration de RLS foram adicionados.
- README corrigido de Flask para FastAPI.
- Script `npm run typecheck` adicionado.

## Supabase via MCP

Executar primeiro as consultas de inspeção. Não aplicar `000_base_schema.sql` em um banco que já possui as tabelas reais sem comparar o schema.

### 1. Inventário do schema

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;

select table_name, constraint_name, constraint_type
from information_schema.table_constraints
where table_schema = 'public'
order by table_name, constraint_name;
```

### 2. RLS e policies

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

A migration `backend/supabase/migrations/011_rls_and_data_integrity.sql` deve ser comparada com o schema remoto antes de ser aplicada. Ela habilita RLS, substitui policies que comparavam `auth.uid()` com e-mail, cria `get_current_usuario_id()`, adiciona `recompensas.usuario_id` e `recompensas.missao_id`, normaliza estados legados e remove escrita direta do domínio pelo anon/authenticated. Recompensas que estavam liberadas para reciclagens pendentes são canceladas para evitar pontos antecipados.

### 3. Dados antes de alterar

```sql
select status, count(*) from tags group by status;
select status, count(*) from reciclagens group by status;
select tipo, count(*) from usuarios group by tipo;
select count(*) as recompensas_sem_usuario
from recompensas where usuario_id is null;
select count(*) as reciclagens_sem_recompensa
from reciclagens rec
left join recompensas rew on rew.reciclagem_id = rec.id
where rec.status = 'validada' and rew.id is null;
select count(*) as missoes from missoes;
select count(*) as usuarios from usuarios;
```

`003_update_conquistas_50.sql` é destrutiva para conquistas. Não reaplicar em produção. `007_seed_tags_and_recycling.sql` insere dados fictícios e deve ser avaliada antes de qualquer reset.

### 4. Administrador

Executar somente com o e-mail real, substituindo o placeholder:

```sql
update public.usuarios
set tipo = 'admin'
where email = '<EMAIL_DO_ADMINISTRADOR>';

select id, nome, email, tipo
from public.usuarios
where tipo in ('admin', 'administrador');
```

### 5. Aplicar e validar

Aplicar `011_rls_and_data_integrity.sql` pelo SQL Editor ou MCP somente após a inspeção. Se o banco remoto já tiver colunas equivalentes, adaptar a migration antes de executar.

```sql
select to_regprocedure('public.get_current_usuario_id()');

select proname, prosecdef
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname = 'get_current_usuario_id';

select status, count(*) from tags group by status;
select status, count(*) from reciclagens group by status;
```

Testar com usuários reais:

1. `GET /api/users/me` retorna somente o próprio perfil.
2. `GET /api/tags/me` retorna somente as próprias tags.
3. `POST /api/recycle` cria `pendente` e não libera pontos.
4. `POST /api/admin/validate-tag` valida, libera `disponivel` e cria uma recompensa.
5. Repetir a validação não duplica recompensa.
6. Usuário sem papel administrativo recebe `403` nas rotas administrativas.
7. Cliente anon não consegue inserir ou atualizar registros do domínio.

## Variáveis de ambiente

Backend FastAPI:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `CORS_ORIGINS`

`CORS_ORIGINS` deve conter as origens reais do frontend separadas por vírgula. Nunca colocar `SUPABASE_SERVICE_KEY` no frontend.

Frontend Next.js/Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

`NEXT_PUBLIC_API_URL` deve apontar para a URL pública do backend FastAPI.

## Vercel

Projects separados:

- Frontend: root directory `recicla-ai-expoceep-app/`.
- Backend: root directory `backend/`.
- Backend Python: 3.11 ou superior.
- O backend usa `backend/vercel.json` para a entrada Python e as rotas `/api/*`.

Verificar sem publicar:

```bash
cd backend
vercel env ls
vercel project ls
vercel inspect
```

Publicar somente depois da validação do banco e das variáveis:

```bash
vercel --cwd backend --prod
vercel --cwd recicla-ai-expoceep-app --prod
```

Esses comandos não foram executados nesta sessão.

## Verificações locais já executadas

- `pytest`: 3 testes passaram.
- `python -m compileall`: passou.
- `npm run typecheck`: passou.
- `npm run lint`: passou sem erros; ficaram quatro avisos de `<img>` em componentes legados.
- `npm run build`: passou.
- `git diff --check`: passou.

## Pendências externas

- Confirmar o schema real e aplicar a migration `011` no Supabase.
- Confirmar recompensas antigas sem `usuario_id`.
- Confirmar tipos de administrador e funcionário.
- Validar RLS com anon, authenticated e service role.
- Validar variáveis e root directories na Vercel.
- Os botões de recompensas ainda são apenas interface existente; não foi criada uma API nova de resgate.
- A página de missões ainda reutiliza a lista de conquistas; a correção completa depende de definir o comportamento de produto.
- Existem duas árvores históricas de migrations; a árvore do Supabase CLI é `backend/supabase/migrations/`.
- O código Prisma gerado permanece como legado e não possui dependências ativas no `package.json`.
