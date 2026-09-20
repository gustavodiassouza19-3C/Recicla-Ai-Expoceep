# AGENTS.md — Recicla-Ai-Expoceep

Regras obrigatórias para qualquer IA trabalhando neste repositório.

## Estrutura do repo

- `recicla-ai-expoceep-app/` — app Next.js (App Router em `src/app/`, componentes em `components/ui/`, util `src/lib/utils.ts`).
- Raiz — `README.md`, `LICENSE`, `.gitignore`, `AGENTS.md`, `opencode.json`. Nada de código solto na raiz.
- `apple-design-skill/` — skill de design review (gitignored, sem `.git` aninhado).

## FRONTEND — shadcn liberado via MCP

**Componentes shadcn são permitidos neste projeto.** O MCP `shadcn`
(`opencode.json`) dá acesso ao registry: buscar, listar e instalar componentes,
blocos e templates por linguagem natural (ex. "adicione o dialog do registry
shadcn").

- Instalar componentes via MCP/CLI do shadcn é o fluxo padrão; nada de
  reinventar button, dialog, card etc. à mão.
- Novas libs de UI fora do ecossistema shadcn (MUI, Chakra, Ant Design,
  DaisyUI...) continuam proibidas sem aprovação explícita do dono.
- `components.json` do app vive em `recicla-ai-expoceep-app/` (o MCP usa ele
  para saber onde instalar). Não mover para a raiz.

### Fluxo obrigatório ao criar ou alterar qualquer UI

Ferramentar as skills **em conjunto**, nesta ordem:

1. **`ReciclaAi-design`** (skill `ReciclaAi-design`) — ler ANTES de escrever qualquer
   CSS/JSX. Fonte da verdade para tokens: paleta oklch, grade 4px, escala de raio,
   padrões de componentes, motion, anti-patterns. Nenhum valor fora dos tokens.
2. **`taste-skill`** ou **`emil-design-eng`** — definir a direção visual antes de
   codar. `taste-skill` para landing pages e anti-slop; `emil-design-eng` para
   UI polish e animação (estilo Vercel/Linear).
3. **Obter o componente via MCP/CLI do shadcn** em
   `recicla-ai-expoceep-app/components/ui/` (ou pasta de domínio, ex.
   `components/dashboard/`), aplicando os tokens do passo 1.
4. **`impeccable shape`** — planejar UX/UI antes de escrever código. Definir
   hierarquia, fluxo do usuário, empty states.
5. **Implementar** com shadcn + tokens do projeto + `mobile-native` para
   garantir sensação nativo no phone.
6. **`impeccable audit`** + **`mobile-native`** — verificar qualidade técnica:
   a11y (contraste ≥ 4.5:1, alvos ≥ 44pt), performance, responsive, anti-patterns
   (61 regras do detector).
7. **`impeccable polish`** — pass final de design system, alinhamento visual,
   shipping readiness.
8. **`apple-design-skill`** (`./apple-design-skill/SKILL.md` + `references/hig/`) —
   revisar convenções de plataforma e acessibilidade antes de commitar.

### Regras por cenário

Qual skill usar conforme o tipo de tarefa:

| Tarefa | Skill principal | Complemento |
|--------|----------------|-------------|
| Criar componente novo | `impeccable shape` | `emil-design-eng` |
| Refazer tela existente | `redesign-skill` | `impeccable critique` |
| Landing page | `taste-skill` | `impeccable polish` |
| Melhorar animações | `animate` | `review-animations` |
| Mobile-first | `mobile-native` | `impeccable adapt` |
| Audit rápido | `impeccable audit` | 61 regras de detector |
| UI premium/agency | `soft-skill` | `impeccable bolder` |
| Anti-slop genérico | `taste-skill` | `impeccable distill` |
| Brand guidelines | `brandkit` | `imagegen-frontend-web` |
| Fazer webapp parecer nativo | `mobile-native` | `apple-design` |
| Hierarquia de tipografia | `impeccable typeset` | `emil-design-eng` |
| Espaçamento/layout | `impeccable layout` | `impeccable delight` |
| Output completo (sem truncar) | `output-skill` | — |
| Revisar animações existentes | `review-animations` | `improve-animations` |

### Anti-patterns (obrigatório verificar)

Antes de commitar UI, verificar:

**Do impeccable (61 regras de detector):**
- Não usar fontes overused (Arial, Inter, system defaults)
- Não usar cinza em fundo colorido
- Não usar preto/cinza puro (sempre tintar)
- Não envolver tudo em cards ou aninhar cards dentro de cards
- Não usar bounce/elastic easing (parece datado)
- Não usar bordas laterais em tabs (side-tab borders)
- Não usar gradientes roxo-azul genéricos
- Verificar targets de toque ≥ 44pt
- Verificar contraste ≥ 4.5:1
- Verificar line length (max 75ch para texto corrido)

**Do taste-skill (anti-slop):**
- Não gerar UI genérica/templated
- Sempre ler o brief primeiro e inferir a direção design
- Usar dicas de DESIGN_VARIANCE, MOTION_INTENSITY, VISUAL_DENSITY
- Evitar cards-inside-cards-inside-cards
- Hero deve ser clean, spacious, readable

**Do mobile-native:**
- Tap highlights em mobile
- Corrigir bug do 100vh
- Inputs que não causam zoom
- Safe areas em phones com notch
- Hover states sticky em touch

### Padrão de componente

- `React.forwardRef` + `cn()` + spread de `...props`.
- Exportar nome PascalCase **e** alias minúsculo (`export { Card, Card as card }`).
- `components/ui/index.ts` — barrel com todos os exports.
- Cores só via variáveis CSS (`var(--...)`), nunca hex hardcoded.
- Espaçamentos múltiplos de 4px; raio da escala 4/8/12/16px.
- Páginas interativas no App Router usam `"use client"`.
- Validar com `npx tsc --noEmit` e `npm run build` antes de commitar.

### Mobile-First (prioridade máxima)

**A UI/UX mobile tem prioridade sobre desktop.** Toda interface deve ser
pensada e projetada primeiro para telas pequenas (320px–480px) antes de
adaptar para desktop.

- Layouts empilhados (`flex-col`, `grid-cols-1`) como base; expandir para
  desktop via `md:` ou `lg:` breakpoints.
- Tap targets mínimo de 44×44pt (WCAG 2.2). Botões e links em mobile
  precisam de padding generoso.
- Evitar horizontal scroll. Tabelas e listas largas devem usar cards
  empilhados ou scroll horizontal com snap.
- Navegação: hamburger menu ou bottom nav em mobile; tabs/nav só em `md+`.
- Fontes: `text-sm`/`text-base` como padrão mobile; `text-lg+` só em `md+`.
- Animações leves em mobile (reduced motion via `prefers-reduced-motion`).
- Testar sempre com `playwright` em viewport 375×812 (iPhone 14) antes de
  considerar pronto.

### Legado

Os arquivos atuais em `components/ui/` vieram de um upload derivado de shadcn e
são a base sancionada: evoluí-los via MCP/CLI do shadcn seguindo este fluxo.
Não copiar esse estilo para componentes novos sem passar pelo fluxo acima.

## Design Skills (`.opencode/skills/`)

Skills de design instaladas no projeto para melhorar qualidade visual e UX.
Todas as skills ficam em `.opencode/skills/` e são descobertas automaticamente
pelo OpenCode via `skill` tool.

### emilkowalski/skills (38.9k stars)
- `emil-design-eng` — filosofia de UI polish e animação (Vercel/Linear)
- `animate` — criar animações com curvas e durações corretas
- `apple-design` — princípios Apple para web
- `mobile-native` — fazer webapp parecer nativo em phone
- `review-animations` — revisar animações existentes
- `improve-animations` — auditar e melhorar animações do codebase
- `find-animation-opportunities` — encontrar onde motion agrega
- `animation-vocabulary` — vocabulário certo para descrever motion
- `pick-ui-library` — escolher lib de UI confiável
- `prototype` — criar múltiplas variantes de UI

### pbakaus/impeccable (69.2k stars)
- `impeccable` — skill principal com 24 comandos:
  - `audit` — checks técnicos (a11y, performance, responsive)
  - `polish` — pass final de design system
  - `critique` — review UX (hierarquia, clareza, ressonância)
  - `shape` — planejar UX/UI antes de código
  - `animate` — adicionar motion propositivo
  - `bolder` / `quieter` — amplificar ou suavizar designs
  - `distill` — reduzir à essência
  - `harden` — error handling, edge cases, i18n
  - `onboard` — first-run flows, empty states
  - `colorize` — cor estratégica
  - `typeset` — hierarchy e sizing de fontes
  - `layout` — spacing, ritmo visual
  - `delight` — momentos de alegria
  - `overdrive` — efeitos tecnicamente extraordinários
  - `clarify` — melhorar UX copy
  - `adapt` — adaptar para dispositivos
  - `optimize` — melhorias de performance
  - `live` — iteração visual no browser
  - `generate` — gerar variantes no browser
- 61 regras de detector anti-patterns

### Leonxlnx/taste-skill (88.5k stars)
- `taste-skill` (design-taste-frontend) — anti-slop para landing pages
- `redesign-skill` — upgrade de sites existentes
- `soft-skill` — UI polida e premium (agency)
- `minimalist-skill` — editorial/Notion/Linear vibes
- `brutalist-skill` — Swiss type, contraste extremo
- `gpt-tasteskill` — variante mais rigorosa para GPT/Codex
- `output-skill` — forçar output completo sem truncamento
- `image-to-code-skill` — pipeline imagem → análise → código
- `stitch-skill` — design system para Google Stitch
- `imagegen-frontend-web` — gerar comps de websites
- `imagegen-frontend-mobile` — gerar telas mobile
- `brandkit` — gerar brand guidelines

### Uso no fluxo de trabalho

Ao criar ou alterar UI, usar as skills nesta ordem:

1. **`taste-skill`** ou **`emil-design-eng`** — definir direção visual
2. **`impeccable` shape** — planejar UX antes de código
3. Implementar com shadcn + tokens do projeto
4. **`impeccable` audit** + **`mobile-native`** — verificar qualidade
5. **`impeccable` polish** — pass final antes de commit

## Git

- Commits pequenos e descritivos (`feat:`, `fix:`, `chore:`).
- Push somente para `main` do `origin` após build passando.
- Nunca commitar `node_modules/`, `.next/`, `.env*`, `*.local.json` ou `.git` aninhado.

## Referência — Claude Cookbooks

- Repo: `anthropics/claude-cookbooks` clonado em `./claude-cookbooks/`.
- Contém notebooks Python com padrões de uso da API Claude: tool use, RAG,
  classificação, visão, agentes, evaluations, extended thinking.
- **Não é uma lib instalável** — é material de referência/educacional.
- Para integrar Claude API no Next.js, usar `@anthropic-ai/sdk` (TypeScript SDK).
- Patterns úteis: `tool_use/`, `capabilities/`, `skills/`, `extended_thinking/`.

## TAREFA PENDENTE — MCP Supabase

**Status:** Aguardando configuracao do MCP Supabase.

Quando o MCP do Supabase estiver configurado, a IA deve:

1. **Sincronizar schema** — usar o MCP para inspectar as tabelas reais no
   Supabase (`usuarios`, `tags`, `reciclagens`, `recompensas`, `missoes`,
   `conquistas`, `eco_pontos`) e comparar com as migrations em
   `backend/migrations/`.
2. **Corrigir divergencias** — ajustar migrations ou modelos Pydantic para
   refletir o estado real do banco (campos extras, tipos diferentes, etc).
3. **Verificar RLS** — confirmar que as Row Level Security policies estao
   corretas para cada tabela (auth, select, insert, update).
4. **Limpar dados de teste** — avaliar se os seeds ficticios (migration 005)
   devem ser mantidos ou removidos.
5. **Testar endpoints** — usar o MCP para executar queries diretas e validar
   que os endpoints do FastAPI retornam dados corretos.
