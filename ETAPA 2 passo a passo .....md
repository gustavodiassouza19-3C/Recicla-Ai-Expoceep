# APRESENTAÇÃO: ETAPA 2 DO PROJETO INTEGRADOR

Tema do grupo: Recicla Aí – Sistema de Reciclagem Urbana e Coleta Seletiva
Turma 3C – Gustavo Dambros Dias de Souza e Ana Heloise Alves
Foco da Etapa: Banco de Dados Relacional, Conexão Supabase (PostgreSQL), Operações CRUD e Rotas da API REST (JSON)

## SLIDE 1: O Objetivo da Etapa 2 (Do Estático ao Dinâmico)

- O que tínhamos na Etapa 1: telas e rotas de teste sem persistência real — os dados não sobreviviam ao restart.
- O que fizemos na Etapa 2:
  1. Conectar a API FastAPI ao banco PostgreSQL do Supabase (tabelas usuarios, tags, reciclagens, missoes, conquistas, eco_pontos).
  2. Implementar as rotas CRUD da entidade principal (usuários e TAGs):
     - Create (POST): cadastrar novos registros.
     - Read (GET): listar e buscar por sessão ou ID.
     - Update (PUT): atualizar dados existentes.
     - Ações (POST): concluir missão, resgatar conquista, validar TAG.
- Contextualização: agora o sistema ganha memória. Toda informação enviada pelo front-end é salva de verdade nas tabelas e permanece lá mesmo se desligarmos o servidor.

![Página inicial do Recicla Aí](evidencias-etapa2/01-landing.png)

## SLIDE 2: Módulo de Conexão com o Banco (backend/app/database.py)

Arquivo: backend/app/database.py

    from supabase import create_client, Client
    from app.config import settings

    def get_supabase() -> Client:
        return create_client(settings.supabase_url, settings.supabase_service_key)

Arquivo: backend/app/config.py

    from pydantic_settings import BaseSettings

    class Settings(BaseSettings):
        supabase_url: str = ""
        supabase_anon_key: str = ""
        supabase_service_key: str = ""

        class Config:
            env_file = ".env"

    settings = Settings()

- Reutilização de código: uma função dedicada abre a conexão e é injetada nas rotas com Depends, sem repetição.
- Segredo fora do código: URL e chaves vêm do arquivo .env, que nunca sobe para o GitHub (regra do .gitignore).
- Dica de ouro (response_model): declarar o modelo de resposta em cada rota transforma a saída em guardiã do contrato — se o banco devolver formato inesperado, a API responde 500 em vez de entregar dado quebrado ao front-end.

## SLIDE 3: Leitura e Listagem de Dados (READ - GET)

Arquivo: backend/app/routes/users.py (rota GET)

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

- O fluxo HTTP GET: o cliente pede os dados com o token, a API valida o token, consulta a tabela usuarios com filtro por id e devolve o JSON com 200 OK.
- Sem token válido, a rota responde 401 Not authenticated antes de tocar no banco.
- Erro comum: esquecer o filtro (.eq) e devolver dados de outros usuários; e esquecer o 404 quando a busca volta vazia.

## SLIDE 4: Inserção de Novos Dados (CREATE - POST)

Arquivo: backend/app/routes/users.py (rota POST)

    @router.post("", response_model=UserResponse)
    async def create_user(data: UserCreate, supabase: Client = Depends(get_supabase)):
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

- Validação automática: o modelo UserCreate exige nome e email. Com corpo vazio, o FastAPI responde 422 com a lista exata dos campos faltantes, sem executar nada.
- Segurança no SQL: a query é montada pelo construtor do supabase-py (tabela, insert, filtros), nunca por concatenação de strings — equivalente à proteção contra SQL Injection do roteiro.
- Código HTTP 201 Created: indica a criação bem-sucedida do recurso. Resposta real em produção: POST /api/users com corpo válido persiste no Supabase e devolve 201.

## SLIDE 5: Atualização e Ações (UPDATE PUT + POST de regra de negócio)

Arquivo: backend/app/routes/users.py (rota PUT)

    @router.put("/me", response_model=UserResponse)
    async def update_me(data: UserCreate, user=Depends(get_current_user),
                        supabase: Client = Depends(get_supabase)):
        update_data = data.model_dump(exclude_unset=True)
        result = supabase.table("usuarios").update(update_data).eq("id", user["id"]).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Usuario nao encontrado")
        pontos = get_user_points(supabase, user["id"])
        return UserResponse(**result.data[0], pontos=pontos)

- model_dump(exclude_unset=True): envia ao banco só os campos que o cliente mandou, sem apagar os demais.
- O filtro .eq("id", ...) é o WHERE: sem ele, o UPDATE atingiria todas as linhas.
- Ações além do CRUD, com os mesmos blocos:
  - POST /api/missions/{id}/complete — conclui a missão e libera a recompensa.
  - POST /api/achievements/{codigo}/claim — resgata a conquista e preenche resgatada_em.
  - POST /api/admin/validate-tag — o admin valida e libera a TAG NFC.
- Remoção (DELETE) não é exposta publicamente por segurança; exclusões passam pelo painel admin com RLS no Supabase.

## SLIDE 6: Como Testar o CRUD sem o Front-End Pronto

Ferramentas recomendadas:

1. Thunder Client (extensão do VS Code).
2. Postman ou Insomnia.
3. curl no terminal.
4. Navegador (apenas para GET públicos e telas).

Exemplos reais executados pelo grupo (base de produção):

    curl $B/api/health
    {"status":"ok"}  →  HTTP 200

    curl $B/api/admin/stats
    {"total_usuarios":2,"total_tags_validadas":10,"total_pontos":100,...}  →  HTTP 200

    curl -X POST $B/api/users -H "Content-Type: application/json" -d '{}'
    {"detail":[{"type":"missing","loc":["body","nome"],...}]}  →  HTTP 422

    curl $B/api/users/me
    {"detail":"Not authenticated"}  →  HTTP 401

Conceito chave: o back-end não precisa da tela pronta para ser testado. Testamos o envio e o recebimento dos pacotes JSON com ferramentas de requisição HTTP, conferindo corpo e status de cada rota.

## SLIDE 7: Checklist de Entregáveis da Etapa 2

Cada grupo deve entregar:

- [ ] backend/app/database.py e config.py configurados, lendo credenciais do .env.
- [ ] Rotas GET, POST e PUT implementadas e validadas (users, tags, recycling, missions, achievements, eco-points, admin).
- [ ] Tabelas e seeds aplicadas no Supabase de produção (usuarios, tags, reciclagens, missoes, conquistas, eco_pontos), conferidas via SQL Editor.
- [ ] Prints e evidências no relatório mostrando as rotas funcionando (200, 201) e os tratamentos (401, 404, 422).
- [ ] Commit e push na branch main do GitHub com o código do CRUD e o relatório da Etapa 2.
