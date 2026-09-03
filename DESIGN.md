# Design System — Recicla-Ai-Expoceep

<!-- impeccable:design-schema 1 -->

## Tokens

### Brand
| Token | Value |
|---|---|
| --color-brand-50 | #f0fdf4 |
| --color-brand-100 | #dcfce7 |
| --color-brand-500 | #22c55e |
| --color-brand-600 | #16a34a |
| --color-brand-700 | #15803d |

### Neutral (use these, no gray/slate)
| Token | Value |
|---|---|
| --color-neutral-50 | #fafafa |
| --color-neutral-100 | #f5f5f5 |
| --color-neutral-200 | #e5e5e5 |
| --color-neutral-300 | #d4d4d4 |
| --color-neutral-400 | #a3a3a3 |
| --color-neutral-500 | #737373 |
| --color-neutral-600 | #525252 |
| --color-neutral-700 | #404040 |
| --color-neutral-800 | #262626 |
| --color-neutral-900 | #171717 |
| --color-neutral-950 | #0a0a0a |

### Semantic
| Token | Value |
|---|---|
| --color-bg-primary | var(--color-neutral-50) |
| --color-bg-secondary | var(--color-white) |
| --color-bg-tertiary | var(--color-neutral-100) |
| --color-text-primary | var(--color-neutral-900) |
| --color-text-secondary | var(--color-neutral-600) |
| --color-text-muted | var(--color-neutral-400) |
| --color-border-primary | var(--color-neutral-200) |
| --color-border-focus | var(--color-brand-500) |

### Shadows
- `.shadow-elevation-1` — hover sutil
- `.shadow-elevation-2` — card repouso
- `.shadow-elevation-3` — hover card / dropdown
- `.shadow-elevation-4` — modal / sheet

### Typography
- `.text-display` — Hero (4xl/5xl/6xl semibold tracking-tight leading-[1.1])
- `.text-h1` — Section (3xl/4xl semibold tracking-tight leading-[1.15])
- `.text-h2` — Subsection (2xl/3xl medium tracking-tight leading-[1.2])
- `.text-h3` — Card title (xl/2xl medium leading-[1.3])
- `.text-body-lg` — Lead (base/lg leading-[1.7] neutral-600)
- `.text-body` — Default (sm/base leading-[1.6] neutral-600)
- `.text-small` — Meta (xs/sm leading-[1.5] neutral-500)

### Spacing (Tailwind v4)
--space-0: 0; --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem; --space-5: 1.25rem; --space-6: 1.5rem; --space-8: 2rem; --space-10: 2.5rem; --space-12: 3rem; --space-16: 4rem; --space-20: 5rem; --space-24: 6rem.

## Rules (immutable)
- Zero `rounded-full` — use `rounded-xl`/`rounded-2xl`
- Zero `shadow-lg`/`shadow-xl` genérico — use `shadow-elevation-*`
- Zero `transition-all` — transições explícitas
- Zero `animate-pulse`/`animate-spin` como loading — use skeleton/shimmer
- Zero `gray-*` backgrounds — use brand/neutral tokens
- Microinterações Framer Motion obrigatórias (whileHover/whileTap)
- Dark mode obrigatório em tudo (bg, border, text, placeholder)
- A11y AA (contraste 4.5:1, focus-visible:ring-2, aria-labels)
- Reduced motion respeitado

## Mode

**Operate** — dashboard/task UI. Scanability, consistency, native affordances. Brand lives in precise details.

## Surface brief

- Figma template: https://www.figma.com/design/t1e7kjtTICzWjZ3QstTjKq/Daily-Hero-2----Arkkhe?node-id=17001-48&t=eBhsck4hu5XvgGxi-4
- Componentes: Button (primary/secondary/ghost/destructive), Card, Input, Dialog, Tabs, Toast (Sonner)
- Layout: max-w-7xl, px-4 sm:px-6 lg:px-8, gap-6 desktop / gap-4 mobile, p-6 desktop / p-4 mobile
