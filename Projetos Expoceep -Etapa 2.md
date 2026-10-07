# ETAPA 2: GUIA DE DESENVOLVIMENTO – PROJETO INTEGRADOR (3º TRIMESTRE)

Projeto Integrador EXPOCEEP 2026 – Recicla Aí: Sistema de Reciclagem Urbana e Coleta Seletiva

- Prazo de Entrega/Avaliação: Até 25/09/2026
- Valor desta Etapa: 2,0 Pontos (da Nota Parcial de 5,0)
- Componente: Programação Back-End
- Turma: 3C – Técnico em Desenvolvimento de Sistemas
- Integrantes: Gustavo Dambros Dias de Souza e Ana Heloise Alves
- Repositório: https://github.com/gustavodiassouza19-3C/Recicla-Ai-Expoceep
- Stack do grupo: FastAPI (Python) + Supabase (PostgreSQL) + Next.js, deploy na Vercel

## OBJETIVO DA ETAPA 2

Transformar a estrutura inicial em uma API RESTful que funciona de verdade. A gente liga a aplicação Python (FastAPI) ao banco relacional (Supabase/PostgreSQL) e implementa o CRUD (CREATE, READ, UPDATE) mais as ações da regra de negócio nas entidades principais do Recicla Aí. Depois valida cada rota com requisições HTTP reais.

As entidades que gravamos: usuarios, tags, reciclagens, recompensas, missoes, conquistas, eco_pontos e usuario_conquistas.

## CHECKLIST DO QUE O GRUPO ENTREGA E MOSTRA

### 1. Conexão com o banco e CRUD no Python (1,0 pt)

- backend/app/database.py com a função de conexão reutilizável, e backend/app/config.py lendo as credenciais do .env.
- POST (Create) cadastrando com validação do Pydantic e respondendo 201 Created (se faltar campo, 422).
- GET (Read) listando e detalhando em JSON com 200 OK.
- PUT (Update) editando pelo ID ou pela sessão, com 200 OK (ou 404).
- POSTs da regra de negócio: concluir missão, resgatar conquista, validar TAG (admin).

### 2. Validação das rotas com requisições HTTP (0,5 pt)

- Uma coleção de testes no Thunder Client (ou curl), um request por rota.
- Conferir o status de cada operação: 200, 201, 401 sem token, 404 com ID que não existe e 422 com campo faltando.

### 3. Repositório Git/GitHub e Relatório Técnico (0,5 pt)

- Commits do CRUD sincronizados na main do GitHub.
- .gitignore segurando .env*, node_modules/, .next/ e *.db.
- Relatório Técnico da Etapa 2 com os prints de cada rota funcionando e o link do repositório.

## ESTRUTURA DO PROJETO RECICLA AÍ

    Recicla-Ai-Expoceep/
    ├── backend/
    │   ├── api/
    │   │   └── index.py            (ponto de entrada na Vercel: from app.main import app)
    │   ├── app/
    │   │   ├── main.py             (cria o FastAPI e registra os routers)
    │   │   ├── config.py           (lê SUPABASE_URL e chaves do .env)
    │   │   ├── database.py         (fábrica de clients Supabase)
    │   │   ├── auth.py             (valida o token e devolve o usuário atual)
    │   │   ├── models/             (contratos Pydantic: user, tag, mission, achievement, eco_point, recycling)
    │   │   ├── routes/             (users, tags, recycling, missions, achievements, eco_points, admin)
    │   │   └── services/           (regras: points, achievements, impact, tags)
    │   ├── migrations/             (SQL versionado das tabelas e seeds)
    │   └── vercel.json             (roteia /api/* para api/index.py)
    └── recicla-ai-expoceep-app/
        └── src/
            ├── app/                (telas e API routes do Next.js)
            ├── components/         (dashboard, landing, ui)
            ├── contexts/           (auth-context, points-context)
            └── lib/                (api.ts, supabase.ts)

## EXEMPLO DE CRUD DO RECICLA AÍ (USUÁRIOS)

Arquivo backend/app/routes/users.py (igual ao que está no repositório):

    from fastapi import APIRouter, Depends, HTTPException
    from supabase import Client
    from app.database import get_supabase
    from app.auth import get_current_user
    from app.models.user import UserCreate, UserResponse
    from app.services.points_service import get_user_points

    router = APIRouter(prefix="/api/users", tags=["users"])

    # 1. READ (GET)
    @router.get("/me", response_model=UserResponse)
    async def get_me(
        user=Depends(get_current_user),
        supabase: Client = Depends(get_supabase),
    ):
        result = supabase.table("usuarios").select("*").eq("id", user["id"]).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado")
        data = result.data[0]
        pontos = get_user_points(supabase, data["id"])
        return UserResponse(**data, pontos=pontos)

    # 2. CREATE (POST)
    @router.post("", response_model=UserResponse)
    async def create_user(
        data: UserCreate,
        supabase: Client = Depends(get_supabase),
    ):
        user_data = {
            "nome": data.nome,
            "email": data.email,
            "cpf": data.cpf,
            "sexo": data.sexo,
            "idade": data.idade,
            "senha": "",
            "tipo": data.tipo or "cidadao",
        }
        result = supabase.table("usuarios").insert(user_data).execute()
        return UserResponse(**result.data[0], pontos=0)

    # 3. UPDATE (PUT)
    @router.put("/me", response_model=UserResponse)
    async def update_me(
        data: UserCreate,
        user=Depends(get_current_user),
        supabase: Client = Depends(get_supabase),
    ):
        update_data = data.model_dump(exclude_unset=True)
        result = (
            supabase.table("usuarios")
            .update(update_data)
            .eq("id", user["id"])
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado")
        pontos = get_user_points(supabase, user["id"])
        return UserResponse(**result.data[0], pontos=pontos)

Modelo backend/app/models/user.py:

    class UserCreate(BaseModel):
        nome: str
        email: str
        cpf: Optional[str] = None
        sexo: Optional[str] = None
        idade: Optional[int] = None
        tipo: Optional[str] = "cidadao"

Conexão backend/app/database.py:

    from supabase import create_client, Client
    from app.config import settings

    def get_supabase() -> Client:
        return create_client(settings.supabase_url, settings.supabase_service_key)

## ENTENDENDO O CRUD: O QUE SIGNIFICA CADA LINHA

### CONFIGURAÇÃO E CONEXÃO

    router = APIRouter(prefix="/api/users", tags=["users"])

Isso junta as rotas num grupo com prefixo fixo. Tudo que vem decorado abaixo responde em /api/users/... O tags serve para organizar a documentação automática.

    supabase: Client = Depends(get_supabase)

O Depends injeta a conexão com o banco em cada rota. Assim ninguém repete código de conexão espalhado: abre a ponte e entrega pronta.

    from app.config import settings  (dentro de database.py)

URL e chaves do Supabase vêm do arquivo .env, que nunca sobe para o GitHub. Se essa separação não existisse, a chave ia parar no repositório junto com o código.

### ROTA READ (GET /api/users/me)

    user=Depends(get_current_user)

Lê o token Bearer do cabeçalho Authorization e devolve quem está logado. Sem token válido, a rota responde 401 antes de encostar no banco.

    result = supabase.table("usuarios").select("*").eq("id", user["id"]).execute()

Aqui monta a consulta: tabela usuarios, todas as colunas, filtro id = ... O .execute() é o que envia para o PostgreSQL. Como a query sai do construtor do supabase-py, sem concatenar strings, não tem brecha de SQL Injection.

    if not result.data:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")

Busca vazia quer dizer ID inexistente, então responde 404 Not Found em vez de quebrar.

    return UserResponse(**data, pontos=pontos)

O response_model=UserResponse confere a saída: se o banco devolver algo fora do formato, a API responde 500 em vez de passar dado quebrado para o front. O pontos vem do serviço de pontos, não da tabela.

### ROTA CREATE (POST /api/users)

    data: UserCreate

O corpo JSON passa pela validação do Pydantic antes da função rodar. Faltou nome ou email, o FastAPI sozinho responde 422 com a lista exata do que está faltando. Foi assim que capturamos em produção:

    POST /api/users com corpo {}  →  HTTP 422
    {"detail": [
      {"type": "missing", "loc": ["body", "nome"], "msg": "Field required", "input": {}},
      {"type": "missing", "loc": ["body", "email"], "msg": "Field required", "input": {}}
    ]}

    supabase.table("usuarios").insert(user_data).execute()

Esse INSERT grava o registro. Com o corpo certo, a rota responde 201 Created trazendo o usuário criado.

### ROTA UPDATE (PUT /api/users/me)

    update_data = data.model_dump(exclude_unset=True)

Transforma o corpo em dicionário só com os campos que o cliente mandou. Desse jeito, atualizar só o nome não apaga o resto.

    .update(update_data).eq("id", user["id"])

O .eq("id", ...) é o WHERE da história. Sem ele o UPDATE pega a tabela inteira, então esse filtro é obrigatório em qualquer edição (e em qualquer remoção).

### AÇÕES DA REGRA DE NEGÓCIO (POST SEM CRUD PURO)

Nem toda rota é CRUD. No Recicla Aí tem ação que executa regra, por exemplo:

    POST /api/missions/{id}/complete   → conclui a missão e libera a recompensa em pontos
    POST /api/achievements/{codigo}/claim → resgata a conquista e preenche resgatada_em
    POST /api/admin/validate-tag       → o admin valida e libera a TAG NFC do usuário

Elas usam os mesmos blocos (Depends, HTTPException 404/400, insert/update) para gravar cada passo no banco.

## COMO TESTAR SEM O FRONT-END PRONTO

Dá para usar Thunder Client (extensão do VS Code), Postman, Insomnia ou curl no terminal. O back-end não precisa de tela para ser testado: a gente manda HTTP e confere o JSON com o status.

O que o grupo rodou de verdade (base de produção, B=https://backend-neon-chi-96.vercel.app):

    curl -s -w "\nHTTP %{http_code}\n" $B/api/health
    {"status":"ok"}  →  HTTP 200

    curl -s -w "\nHTTP %{http_code}\n" $B/api/admin/stats
    {"total_usuarios":2,"total_tags_validadas":10,"total_pontos":100,...}  →  HTTP 200

    curl -s -X POST $B/api/users -H "Content-Type: application/json" -d '{}'
    {"detail":[...Field required...]}  →  HTTP 422

    curl -s -w "\nHTTP %{http_code}\n" $B/api/users/me
    {"detail":"Not authenticated"}  →  HTTP 401

Como ler os status no Recicla Aí:

| Status | Significado | Quando aparece |
| :---- | :---- | :---- |
| 200 OK | Leitura, edição ou ação deu certo | GET /me, PUT /me, POST /claim |
| 201 Created | Recurso criado | POST /api/users, POST /api/tags |
| 401 Not authenticated | Falta token válido | GET /me sem Authorization |
| 404 Not Found | ID não existe | PUT em usuário inexistente, missão inválida |
| 422 Unprocessable Entity | Corpo fora do contrato | POST /api/users sem nome/email |
| 500 Internal Server Error | Erro não tratado | Modelo de resposta diferente do banco (ver abaixo) |

## O QUE O GRUPO APRENDEU: CONTRATO X BANCO

No meio da Etapa 2, o GET /api/eco-points só respondia 500. Fomos olhar e o modelo Pydantic estava em inglês (name, address) enquanto a tabela eco_pontos usa nome e endereco. A validação do response_model barrava todas as linhas.

Arrumamos em backend/app/models/eco_point.py: campos viraram nome e endereco, mais status e criado_em, que são as colunas de verdade da tabela. Fica a dica: quando der 500, o primeiro lugar a conferir é se o modelo bate com as colunas. Na maioria das vezes o problema está aí, não na rota.

O outro 500 foi o GET /api/missions, por um motivo diferente: as tabelas missoes e missoes_usuario nem existiam no banco de produção (erro PGRST205, fora do schema cache). Rodamos a migration no SQL Editor do Supabase e voltou ao normal. Outra dica: não basta a migration existir no repositório, tem que confirmar que ela rodou no banco de produção.

## PARA APRESENTAR: A ANALOGIA DO GARÇOM (TURMA 3C)

A analogia que a gente vai usar para explicar:

- O corpo JSON mandado no Thunder Client é o pedido na comanda (ex: cadastrar o usuário da coleta).
- O Supabase é a cozinha, onde o dado fica guardado nas tabelas (usuarios, tags, reciclagens).
- O return com o modelo de resposta é o garçom trazendo o prato pronto (JSON) para a mesa.
- O status HTTP (200, 201, 401, 404, 422) diz como o pedido foi atendido.

Tela inicial do sistema, que essas rotas alimentam:

![Tela inicial do Recicla Aí](evidencias-etapa2/01-landing.png)
