# AGENTS.md — Recicla-Ai-Expoceep

Regras obrigatórias para qualquer IA trabalhando neste repositório.

## Estrutura do repo

- `recicla-ai-expoceep-app/` — app Next.js (App Router em `src/app/`, componentes em `components/ui/`, util `src/lib/utils.ts`).
- Raiz — somente `README.md`, `LICENSE`, `.gitignore`. Nada de código solto na raiz.
- `apple-design-skill/` — skill de design review (gitignored, sem `.git` aninhado).

## REGRA DE OURO DO FRONTEND — componentes 100% originais

**É proibido usar qualquer biblioteca de componentes pronta ou código copiado:**

- Nada de shadcn, MUI, Chakra, Ant Design, DaisyUI, Headless UI ou similares.
- Nada de `components.json`, CLI de shadcn, nem copiar código de shadcn para dentro do repo.
- Nada de instalar nova lib de UI sem aprovação explícita do dono.

**Componentes são criados à mão, com as skills, do zero.** Ferramentas permitidas
(primitivos, não componentes prontos): Tailwind CSS, `clsx` + `tailwind-merge`
(via `cn()` em `src/lib/utils.ts`), `@radix-ui/react-slot` (polimorfismo `asChild`)
e framer-motion (motion expressivo).

### Fluxo obrigatório ao criar ou alterar qualquer UI

Ferramentar as 3 skills **em conjunto**, nesta ordem:

1. **`ReciclaAi-design`** (skill `ReciclaAi-design`) — ler ANTES de escrever qualquer
   CSS/JSX. Fonte da verdade para tokens: paleta oklch, grade 4px, escala de raio,
   padrões de componentes, motion, anti-patterns. Nenhum valor fora dos tokens.
2. **Construir o componente original** em `recicla-ai-expoceep-app/components/ui/`
   (ou pasta de domínio, ex. `components/dashboard/`), partindo dos tokens.
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
são **legado**: substituí-los progressivamente por componentes originais seguindo
este fluxo. Não copiar esse estilo para componentes novos.

## Git

- Commits pequenos e descritivos (`feat:`, `fix:`, `chore:`).
- Push somente para `main` do `origin` após build passando.
- Nunca commitar `node_modules/`, `.next/`, `.env*`, `*.local.json` ou `.git` aninhado.
