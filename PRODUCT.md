# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16.3.1, React 19.2.8, TypeScript 5, Tailwind CSS v4, shadcn/ui (Radix), Prisma 7.9.1, Framer Motion 13.1.1, Sonner. MCP: shadcn, figma, playwright.

## Users

Reciclagem (recycling) — gestores e operadores da Expoceep que precisam administrar lacres, rastrear resíduos e gerenciar o fluxo de reciclagem da empresa.

## Product Purpose

Sistema web para gestão de lacres e reciclagem da Expoceep. Permite associar lacres, visualizar dashboards, registrar operações e acompanhar métricas de reciclagem em tempo real.

## Positioning

Ferramenta interna de operações de reciclagem que transforma o gerenciamento de lacres em um fluxo visual, rápido e auditável — sem papel, sem planilhas, sem ambiguidade.

## Brand

- App: `recicla-ai-expoceep-app`
- Template Figma: https://www.figma.com/design/t1e7kjtTICzWjZ3QstTjKq/Daily-Hero-2----Arkkhe?node-id=17001-48&t=eBhsck4hu5XvgGxi-4
- Brand colors: `brand-50/100/500/600/700` (#f0fdf4, #dcfce7, #22c55e, #16a34a, #15803d)
- Neutrals: `neutral-50..950` (sem gray/slate)
- Font: Geist (via next/font)

## Durable Constraints

- Regras UI absolutas em `.opencode/instructions.md` (Emil Kowalski guidelines): sem `rounded-full`, sem `shadow-lg` genérico, sem `transition-all`, sem `animate-pulse`, sem `gray-*` backgrounds, sombras em camadas `shadow-elevation-*`, microinterações Framer Motion obrigatórias, dark mode obrigatório, a11y AA, Playwright screenshots antes de considerar UI concluída.
- Figma MCP obrigatório antes de criar qualquer componente novo.
- Impeccable: `/impeccable audit` antes de merge; `/impeccable polish` antes de release.
