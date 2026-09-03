# Emil Kowalski UI/UX Guidelines — Recicla-Ai-Expoceep

> **Regra absoluta**: Estes princípios são lei. Qualquer código de interface que viole estas regras será rejeitado.

---

## 1. Princípios Fundamentais

### 1.1 Não Pareça IA
- **Zero** `rounded-full` em botões/containers — use `rounded-xl` (12px) ou `rounded-2xl` (16px)
- **Zero** sombras `shadow-lg`/`shadow-xl` genéricas — use sombras em camadas (ver §3)
- **Zero** `transition-all` — transições explícitas e intencionais
- **Zero** `animate-pulse`/`animate-spin` como loading — use skeleton contextual ou shimmer
- **Zero** cores `gray-100`/`gray-200` como background principal — use `white` ou `neutral-50` com propósito

### 1.2 Microinterações Obrigatórias (Framer Motion)
```tsx
// Padrão base — NUNCA omitir
<motion.button
  whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 17 } }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
/>
```

| Elemento | Hover | Tap | Transição |
|----------|-------|-----|-----------|
| Botão primário | `scale: 1.02` + `y: -2` + shadow elevation | `scale: 0.98` | spring 400/17 |
| Botão secundário | `scale: 1.01` + border color shift | `scale: 0.99` | spring 300/20 |
| Card interativo | `y: -4` + shadow elevation | `y: 0` | spring 350/18 |
| Input focus | `ring-2` + `scale: 1.005` | — | ease-out 150ms |
| Link/texto clicável | `x: 2` (seta) ou `text-decoration` animate | `scale: 0.99` | spring 300/20 |

### 1.3 Animações de Entrada (Stagger)
```tsx
// Container pai
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
  }}
>
// Filhos
<motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }} }}
</motion.div>
```

---

## 2. Espaçamento & Layout

### 2.1 Escala de Espaçamento (Tailwind v4)
```css
/* Tokens oficiais — NÃO inventar valores */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### 2.2 Regras de Ouro
- **Container max-width**: `max-w-7xl` (1280px) com `px-4 sm:px-6 lg:px-8`
- **Gap entre seções**: `space-y-16` (desktop) / `space-y-10` (mobile)
- **Gap entre cards**: `gap-6` (desktop) / `gap-4` (mobile)
- **Padding interno de cards**: `p-6` (desktop) / `p-4` (mobile)
- **NUNCA** `p-8`+`gap-8` junto — escolha um e seja consistente

---

## 3. Sombras em Camadas (Layered Shadows)

```css
/* Substitua TODAS as sombras tailwind por estas classes utilitárias */
.shadow-elevation-1 { /* hover sutil */
  box-shadow: 
    0 1px 2px 0 rgb(0 0 0 / 0.03),
    0 1px 3px 1px rgb(0 0 0 / 0.05);
}
.shadow-elevation-2 { /* card repouso */
  box-shadow: 
    0 2px 4px -2px rgb(0 0 0 / 0.04),
    0 4px 8px -2px rgb(0 0 0 / 0.06),
    0 12px 16px -4px rgb(0 0 0 / 0.04);
}
.shadow-elevation-3 { /* hover card / dropdown */
  box-shadow: 
    0 4px 8px -3px rgb(0 0 0 / 0.06),
    0 12px 24px -4px rgb(0 0 0 / 0.08),
    0 24px 32px -8px rgb(0 0 0 / 0.06);
}
.shadow-elevation-4 { /* modal / sheet */
  box-shadow: 
    0 8px 16px -4px rgb(0 0 0 / 0.08),
    0 24px 48px -8px rgb(0 0 0 / 0.1),
    0 40px 64px -12px rgb(0 0 0 / 0.08);
}
```

**Uso com Framer Motion**:
```tsx
<motion.div
  style={{ boxShadow: "var(--shadow-elevation-2)" }}
  whileHover={{ 
    style: { boxShadow: "var(--shadow-elevation-3)" },
    transition: { duration: 0.2 }
  }}
/>
```

---

## 4. Tipografia

### 4.1 Escala Tipográfica
```css
/* Heading 1 — Hero */
.text-display { @apply text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]; }

/* Heading 2 — Section */
.text-h1 { @apply text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.15]; }

/* Heading 3 — Subsection */
.text-h2 { @apply text-2xl sm:text-3xl font-medium tracking-tight leading-[1.2]; }

/* Heading 4 — Card title */
.text-h3 { @apply text-xl sm:text-2xl font-medium leading-[1.3]; }

/* Body large — Lead */
.text-body-lg { @apply text-base sm:text-lg leading-[1.7] text-neutral-600; }

/* Body — Default */
.text-body { @apply text-sm sm:text-base leading-[1.6] text-neutral-600; }

/* Small — Meta/Caption */
.text-small { @apply text-xs sm:text-sm leading-[1.5] text-neutral-500; }
```

### 4.2 Regras
- **Line-height** sempre explícito — nunca `leading-normal`/`leading-relaxed` sozinhos
- **Font-weight**: `font-medium` (500) para UI, `font-semibold` (600) para headings, `font-normal` (400) para body
- **Tracking**: `tracking-tight` apenas em headings ≥ `text-2xl`

---

## 5. Cores & Tokens (Tailwind v4 + CSS Variables)

```css
@theme {
  /* Brand */
  --color-brand-50: #f0fdf4;
  --color-brand-100: #dcfce7;
  --color-brand-500: #22c55e;
  --color-brand-600: #16a34a;
  --color-brand-700: #15803d;
  
  /* Neutral — use estes, não gray/slate */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4;
  --color-neutral-400: #a3a3a3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;
  --color-neutral-950: #0a0a0a;
  
  /* Semantic */
  --color-bg-primary: var(--color-neutral-50);
  --color-bg-secondary: var(--color-white);
  --color-bg-tertiary: var(--color-neutral-100);
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-text-muted: var(--color-neutral-400);
  --color-border-primary: var(--color-neutral-200);
  --color-border-focus: var(--color-brand-500);
}
```

**Proibido**: `bg-gray-100`, `text-gray-600`, `border-gray-300` — use tokens semânticos.

---

## 6. Componentes Base (Padrões Obrigatórios)

### 6.1 Button
```tsx
// variants: "primary" | "secondary" | "ghost" | "destructive"
// sizes: "sm" | "md" | "lg" | "icon"
<Button variant="primary" size="md" className="w-full sm:w-auto">
  <motion.span whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 300 }}>
    Salvar
  </motion.span>
</Button>
```

### 6.2 Card
```tsx
<motion.div
  className="rounded-2xl bg-white border border-neutral-200 p-6 transition-shadow duration-200"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -4, boxShadow: "var(--shadow-elevation-3)" }}
  transition={{ type: "spring", stiffness: 350, damping: 18 }}
>
  {/* conteúdo */}
</motion.div>
```

### 6.3 Input
```tsx
<div className="relative">
  <input
    className="peer w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 
      text-neutral-900 placeholder:text-neutral-400
      focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
      transition-[border-color,box-shadow] duration-150
      disabled:cursor-not-allowed disabled:opacity-50"
    placeholder=" "
  />
  <label className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 
    transition-all duration-150
    peer-focus:top-1 peer-focus:text-xs peer-focus:text-brand-600
    peer-focus:font-medium peer-data-[filled]:top-1 peer-data-[filled]:text-xs peer-data-[filled]:text-neutral-500">
    Label
  </label>
</div>
```

---

## 7. Dark Mode (Obrigatório)

```tsx
// Sempre testar em ambos os modos
<div className="bg-white dark:bg-neutral-900 
  border-neutral-200 dark:border-neutral-800
  text-neutral-900 dark:text-neutral-50
  placeholder:text-neutral-400 dark:placeholder:text-neutral-500">
```

- **NUNCA** `dark:` apenas em background — textos, bordas, placeholders, sombras também
- Sombras em dark mode: `rgb(0 0 0 / 0.3)` base, mais opacas

---

## 8. Acessibilidade (Non-Negotiable)

- `focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2` em TUDO interativo
- `aria-label` em botões ícone-only
- `role="alert"` + `aria-live="polite"` em toasts (Sonner já faz)
- Contraste mínimo 4.5:1 (AA) — testar com `npm run lint` + axe
- `prefers-reduced-motion`: desabilitar `whileHover`/`whileTap` animações de scale

```tsx
const prefersReducedMotion = useReducedMotion();
<motion.button
  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
/>
```

---

## 9. Validação Visual (Playwright MCP)

**Antes de considerar QUALQUER tarefa de UI concluída:**

```bash
# 1. Gerar screenshot da página/feature
# 2. Comparar com baseline (se existir)
# 3. Verificar: sem layout shift, cores corretas, sombras corretas, texto legível
# 4. Testar dark mode
# 5. Testar mobile (375px) + desktop (1440px)
# 6. Testar hover/tap states via screenshots sequenciais
```

**Checklist de aprovação visual:**
- [ ] Nenhum elemento "flutuando" sem sombra de contato
- [ ] Espaçamentos consistentes com escala (§2)
- [ ] Microinterações suaves (60fps, sem jank)
- [ ] Dark mode idêntico em estrutura, apenas cores invertidas
- [ ] Focus states visíveis e bonitos
- [ ] Loading states não usam spinner genérico

---

## 10. Figma MCP — Fluxo Obrigatório

**Antes de criar QUALQUER componente novo:**

1. `mcp__figma__get_file` → obter tokens, frames, componentes do template
2. `mcp__figma__get_node` → inspecionar componente específico (spacing, cores, tipografia)
3. `mcp__figma__get_styles` → extrair color styles, text styles, effect styles
4. **Replicar exatamente** — não "inspirar", replicar

Template oficial: https://www.figma.com/design/t1e7kjtTICzWjZ3QstTjKq/Daily-Hero-2----Arkkhe?node-id=17001-48&t=eBhsck4hu5XvgGxi-4

---

## 11. Checklist de Entrega (Todo PR/Task)

| Item | Verificação |
|------|-------------|
| ✅ Tokens semânticos | Nenhum `gray-`/`slate-` hardcoded |
| ✅ Sombras em camadas | `shadow-elevation-*` apenas |
| ✅ Microinterações | `whileHover`/`whileTap` em TODOS elementos interativos |
| ✅ Stagger entrance | Listas/grids animam com stagger 0.06s |
| ✅ Dark mode | Testado e aprovado visualmente |
| ✅ A11y | Focus visible, aria-labels, contraste |
| ✅ Reduced motion | Respeitado |
| ✅ Playwright screenshots | Mobile + Desktop + Dark + Hover states |
| ✅ Figma parity | Componentes matcham template pixel-perfect |

---

## 12. Comandos de Validação Local

```bash
# Lint + Typecheck
npm run lint

# Build (catch type errors)
npm run build

# Visual regression (quando configurado)
npx playwright test --project=chromium

# Storybook (se houver)
npm run storybook
```

---

**Última atualização**: 2026-08-20  
**Versão**: 1.0  
**Autoridade**: Engenheiro Lead — OpenCode Environment