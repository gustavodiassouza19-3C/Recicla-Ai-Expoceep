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

Ferramentar as 3 skills **em conjunto**, nesta ordem:

1. **`ReciclaAi-design`** (skill `ReciclaAi-design`) — ler ANTES de escrever qualquer
   CSS/JSX. Fonte da verdade para tokens: paleta oklch, grade 4px, escala de raio,
   padrões de componentes, motion, anti-patterns. Nenhum valor fora dos tokens.
2. **Obter o componente via MCP/CLI do shadcn** em
   `recicla-ai-expoceep-app/components/ui/` (ou pasta de domínio, ex.
   `components/dashboard/`), aplicando os tokens do passo 1.
3. **`impeccable`** — antes de finalizar, ler `reference/craft-floor.md` e aplicar
   o piso de craft; rodar `audit`/`polish` no alvo antes de commitar.
4. **`apple-design-skill`** (`./apple-design-skill/SKILL.md` + `references/hig/`) —
   revisar acessibilidade (contraste ≥ 4.5:1, alvos de toque ≥ 44pt, screen readers)
   e convenções de plataforma antes de commitar.

### Padrão de componente

- `React.forwardRef` + `cn()` + spread de `...props`.
- Exportar nome PascalCase **e** alias minúsculo (`export { Card, Card as card }`).
- `components/ui/index.ts` — barrel com todos os exports.
- Cores só via variáveis CSS (`var(--...)`), nunca hex hardcoded.
- Espaçamentos múltiplos de 4px; raio da escala 4/8/12/16px.
- Páginas interativas no App Router usam `"use client"`.
- Validar com `npx tsc --noEmit` e `npm run build` antes de commitar.

### Legado

Os arquivos atuais em `components/ui/` vieram de um upload derivado de shadcn e
são a base sancionada: evoluí-los via MCP/CLI do shadcn seguindo este fluxo.
Não copiar esse estilo para componentes novos sem passar pelo fluxo acima.

## Git

- Commits pequenos e descritivos (`feat:`, `fix:`, `chore:`).
- Push somente para `main` do `origin` após build passando.
- Nunca commitar `node_modules/`, `.next/`, `.env*`, `*.local.json` ou `.git` aninhado.
