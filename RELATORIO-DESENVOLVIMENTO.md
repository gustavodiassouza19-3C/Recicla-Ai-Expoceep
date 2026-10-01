# Relatório de Desenvolvimento — Recicla Aí

O projeto **Recicla Aí** foi idealizado e desenvolvido por alunos do curso Técnico em Desenvolvimento de Sistemas, com o objetivo de incentivar a reciclagem urbana através de tags NFC reutilizáveis, recompensas e um aplicativo web.

## Equipe

- **Front-end** — Desenvolvimento da interface web responsiva (Next.js/React)
- **Back-end e Banco de Dados** — API RESTful e modelagem relacional (Python/Flask + Supabase)

## Tecnologias

Utilizamos uma combinação de tecnologias para garantir uma plataforma dinâmica e responsiva:

- **Next.js (React)** para a interface web interativa e mobile-first
- **Python com Flask** no back-end para uma lógica robusta de regras de negócio
- **Supabase (PostgreSQL)** para armazenamento eficiente e seguro de dados
- **Tags NFC** como hardware de vínculo físico entre cidadão e reciclável

## Ferramentas Colaborativas

Ferramentas colaborativas como **GitHub** foram empregadas para controle de versão, enquanto **Figma** e skills de design auxiliaram na criação da identidade visual e na padronização do design system.

## Hospedagem e Acessibilidade

O sistema será hospedado em uma rede local exclusiva da **EXPOCEEP**, acessível via celular ou computador, sem depender de internet externa.

## Qualidade

Testes com colegas e professores asseguraram a qualidade, usabilidade e desempenho da plataforma, seguindo padrões de acessibilidade (WCAG 2.2) e priorizando experiência mobile-first.

## Pendência — Feature de resgate de recompensas (NÃO implementada)

**Situação:** só houve exploração e planejamento; nenhum código da feature foi escrito.
Os botões **"Resgatar"** e **"Historico"** em `/rewards` continuam mortos (item P4 da revisão).

### O que já foi definido (plano pronto)

- **Débito de pontos = linha negativa no ledger `recompensas`:**
  inserir `tipo='pontos'`, `valor=-custo`, `status='liberada'`, `data_liberacao=now`.
  `get_user_points` (`backend/app/services/points_service.py`) soma esse ledger,
  então o saldo cai automaticamente no `/me`, no score-history e nas conquistas.
- **Catálogo:** tabela `catalogo_recompensas` (já populada, endpoint GET existe).
- **Histórico:** tabela nova `resgates` (não existe no banco).

### O que falta fazer

1. **Backend** — em `backend/app/routes/rewards.py`:
   - `POST /api/rewards/{id}/redeem`: valida recompensa ativa → confere saldo via
     `get_user_points` → insere débito no ledger → retorna `novo_saldo`;
     grava histórico em `resgates` com try/except (se tabela faltar, segue sem ela).
   - `GET /api/rewards/resgates` (histórico, degrada para `[]`);
     **declarar ANTES de `GET /{recompensa_id}`** (senão "resgates" vira 422).
2. **Migration** — criar `backend/supabase/migrations/018_create_resgates.sql`
   (tabela + RLS) e **executar no banco**. Ainda não executada: não há SQL direto
   daqui (sem MCP Supabase / sem SQL Editor), e a tentativa de usar a Management
   API com o token do Supabase CLI falhou. Alternativa: usuário rodar o SQL no
   SQL Editor do Supabase, ou `supabase link` + correção manual.
3. **Frontend** — `recicla-ai-expoceep-app/src/app/rewards/page.tsx`:
   - clique no card → diálogo de confirmação (saldo, custo, saldo pós-resgate;
     botão desabilitado se saldo insuficiente) → toast (`sonner`) →
     `setPoints(novo_saldo)` do `points-context`;
   - botão "Resgatar" do hero → scroll até o catálogo;
   - botão "Historico" → diálogo com `GET /api/rewards/resgates`;
   - `redeemReward`/`fetchResgates` em `src/lib/api.ts`.
4. **Validações** — `npx tsc --noEmit`, `npm run build`, teste empírico do débito
   (saldo cai no `/me`) e smoke Playwright em 375×812 e 1280.

### Notas / bloqueios relacionados

- Corrida de saldo (dois resgates simultâneos) — aceito por ora, sem transação.
- RLS de `UPDATE` em `usuarios` segue quebrado (SQL entregue ao usuário, não
  executado) — não bloqueia esta feature (backend usa service key).
- Registro/recuperação de senha bloqueados por rate limit (429) do Supabase na janela.
