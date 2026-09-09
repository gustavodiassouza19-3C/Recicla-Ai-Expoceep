# Recicla-Ai-Expoceep

Sistema digital para incentivar a reciclagem urbana unindo tags NFC reutilizáveis, recompensas e um aplicativo web.

## Sobre o Projeto

O **Recicla Aí** incentiva a reciclagem urbana através de tags NFC reutilizáveis vinculadas ao CPF do cidadão. O sistema aproveita a infraestrutura de coleta seletiva já existente nas cidades, dispensando a necessidade de novo equipamento ou coleta especial.

## Fluxo de Funcionamento

### 1. Vínculo
O cidadão recebe uma tag NFC física, vincula ao seu CPF no aplicativo e a prende na sacola de recicláveis.

### 2. Coleta e Triagem
A sacola é recolhida pela coleta seletiva e enviada ao ecoponto ou centro de triagem.

### 3. Validação
Um funcionário autorizado lê a tag NFC usando o celular para confirmar que o material chegou.

### 4. Recompensa
A confirmação libera automaticamente uma recompensa no aplicativo do cidadão. Limite: até 5 recompensas mensais por CPF, sem depender do peso ou tipo do material.

### 5. Reuso
A tag tem seu status resetado para "disponível" e volta ao sistema para ser utilizada por outra pessoa.

## Arquitetura do Sistema

| Camada | Tecnologia | Função |
|--------|------------|--------|
| **Front-End** | Next.js (React) | Interface web para o usuário acompanhar o saldo/histórico e para o funcionário realizar a leitura na triagem |
| **Back-End** | Python (Flask) | API RESTful responsável por aplicar as regras (limite por CPF, validação de segurança e atualização de status) |
| **Banco de Dados** | Supabase (PostgreSQL) | Guarda as tabelas relacionais de usuários, tags, reciclagens e recompensas |
| **Hardware** | Tags NFC | Etiquetas físicas com código único vinculadas temporariamente a cada entrega |

## Documentação Adicional

- [App — Recicla-Ai-Expoceep](./recicla-ai-expoceep-app/README.md) — README completo com setup, ferramentas de design e fluxo de trabalho
- [AGENTS.md](./AGENTS.md) — regras obrigatórias para IAs (frontend 100% original, fluxo das 3 skills, padrões de commit)
- [apple-design-skill](./apple-design-skill) - Skill de design review para auditoria de UI/UX baseada em Apple HIG