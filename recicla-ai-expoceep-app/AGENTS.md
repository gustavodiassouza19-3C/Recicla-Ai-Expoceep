## Figma Template Reference
Template visual do projeto: https://www.figma.com/design/t1e7kjtTICzWjZ3QstTjKq/Daily-Hero-2----Arkkhe?node-id=17001-48&t=eBhsck4hu5XvgGxi-4
Use o MCP `figma` para consultar tokens, frames e estilos deste arquivo antes de criar componentes.

## Ferramentas de Design com IA

### Impeccable (pbakaus/impeccable)
- **Init**: `/impeccable init` → gera `PRODUCT.md` + `DESIGN.md` (já feito)
- **Audit**: `/impeccable audit [alvo]` → audita UI antes do merge
- **Polish**: `/impeccable polish` → limpeza final anti-slop
- **Hooks**: ativos em `.claude/settings.local.json` (roda em cada edit de UI)
- **Configuração**: `.impeccable/config.json`, `PRODUCT.md`, `DESIGN.md`

### SkillUI (amaancoderx/npxskillui)
- **Extração local**: `npx skillui --dir ./src --name "ReciclaAi" --out ./design-systems/recicla-ai`
- **Extração URL**: `npx skillui --url <url> --mode ultra`
- **Saída**: `design-systems/recicla-ai/reciclaai-design/` (SKILL.md, DESIGN.md, tokens/, references/, screenshots/) — gitignored
- **Leitura**: leia `SKILL.md` + `references/DESIGN.md` antes de implementar qualquer UI

### Playwright
- **Testes**: `npm run test` ou `npx playwright test`
- **Projetos**: `chromium` (1920px), `mobile` (iPhone 13), `dark`
- **Obrigatório**: screenshot em todos os cenários antes de considerar UI concluído

### Ordem obrigatória antes de criar UI:
1. Figma MCP → tokens do template
2. SkillUI → design system atual
3. Impeccable audit → validação visual
4. Playwright → regressão visual (mobile + desktop + dark + hover)
5. `.opencode/instructions.md` §1-§11 → regras absolutas

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
