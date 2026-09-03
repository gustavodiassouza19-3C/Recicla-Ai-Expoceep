This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Ferramentas de Design com IA

### Impeccable (pbakaus/impeccable) — Design audit & polish
- **O que faz**: Skill de design anti-slop com comandos `/impeccable audit`, `polish`, `critique`, `distill`, `shape`, `init`. Detecta e corrige anti-patterns visuais antes do merge.
- **Instalação**: `npx impeccable install` (já feito)
- **Uso no projeto**:
  ```bash
  /impeccable init        # gera PRODUCT.md + DESIGN.md (já feito)
  /impeccable audit       # audita UI atual
  /impeccable polish      # limpeza final
  ```
- **Arquivos**: `.impeccable/`, `PRODUCT.md`, `DESIGN.md`
- **Links**: [impeccable.style](https://impeccable.style) · [github.com/pbakaus/impeccable](https://github.com/pbakaus/impeccable) · [npm](https://www.npmjs.com/package/impeccable)

### SkillUI (amaancoderx/npxskillui) — Reverse-engineering de design systems
- **O que faz**: Extrai design system completo (cores, tipografia, espaçamento, componentes, screenshots) de qualquer site, repositório ou pasta local em `SKILL.md` + `DESIGN.md` + `tokens/*.json` que o Claude lê automaticamente.
- **Instalação**: `npm i -D skillui` (já feito)
- **Uso no projeto**:
  ```bash
  npx skillui --dir ./src --name "ReciclaAi" --out ./design-systems/recicla-ai
  npx skillui --url https://exemplo.com --mode ultra --screens 10
  ```
- **Saída**: `design-systems/recicla-ai/reciclaai-design/` (gitignored)
- **Links**: [skillui.vercel.app](https://skillui.vercel.app) · [github.com/amaancoderx/npxskillui](https://github.com/amaancoderx/npxskillui) · [npm](https://www.npmjs.com/package/skillui)

### Playwright — Testes de regressão visual
- **O que faz**: Testes de screenshot em desktop (1920), mobile (390), dark mode e hover states — obrigatórios antes de considerar qualquer tarefa de UI concluída.
- **Instalação**: `@playwright/test` já no devDependencies + `npx playwright install chromium` (já feito)
- **Uso no projeto**:
  ```bash
  npm run test            # executa todos os testes
  npx playwright test --project=chromium
  npx playwright test --project=mobile
  npx playwright test --project=dark
  ```
- **Arquivo**: `playwright.config.ts`, `tests/screenshot-dashboard.spec.ts`
- **Links**: [playwright.dev](https://playwright.dev) · [github.com/microsoft/playwright](https://github.com/microsoft/playwright)

### Fluxo de trabalho
1. **Figma MCP** → consultar tokens do template antes de criar componente
2. **SkillUI** (`--dir ./src`) → extrair design system atual para referência
3. **Impeccable** (`/impeccable audit`) → auditar antes do merge
4. **Playwright** (`npm run test`) → validar visualmente (mobile + desktop + dark + hover)
5. **.`opencode/instructions.md` §1-§11** → regras absolutas de UI (sem gray, sombras em camadas, microinterações, a11y)
