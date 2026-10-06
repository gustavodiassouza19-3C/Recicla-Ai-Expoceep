from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query, HTTPException, status
from supabase import Client
from app.database import get_supabase
from app.auth import get_admin_user, get_staff_user, grant_welcome_achievement
from app.models.user import AdminCreate
from app.services.admin_service import AdminCreationError, create_admin_usuario
from app.services.points_service import get_user_points
from app.services.impact_service import calculate_impact
from app.models.recompensa import RecompensaCreate

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/recompensas")
async def admin_listar_recompensas(
    admin=Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    """Catalogo completo, incluindo as recompensas pausadas."""
    result = (
        supabase.table("catalogo_recompensas")
        .select("id, titulo, descricao, custo_pontos, categoria, icone, ativa, criado_em")
        .order("criado_em", desc=True)
        .execute()
    )
    return {"recompensas": result.data or []}


@router.post("/recompensas", status_code=status.HTTP_201_CREATED)
async def admin_criar_recompensa(
    data: RecompensaCreate,
    admin=Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    payload = {
        "titulo": data.titulo,
        "descricao": data.descricao,
        "custo_pontos": data.custo_pontos,
        "categoria": data.categoria,
        "ativa": data.ativa,
    }
    if data.icone:
        payload["icone"] = data.icone.strip()

    result = supabase.table("catalogo_recompensas").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Nao foi possivel criar a recompensa")
    return result.data[0]


@router.patch("/recompensas/{recompensa_id}")
async def admin_atualizar_recompensa(
    recompensa_id: int,
    data: RecompensaCreate,
    admin=Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    payload = {
        "titulo": data.titulo,
        "descricao": data.descricao,
        "custo_pontos": data.custo_pontos,
        "categoria": data.categoria,
        "ativa": data.ativa,
    }
    if data.icone:
        payload["icone"] = data.icone.strip()

    result = (
        supabase.table("catalogo_recompensas")
        .update(payload)
        .eq("id", recompensa_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Recompensa nao encontrada")
    return result.data[0]


@router.delete("/recompensas/{recompensa_id}")
async def admin_excluir_recompensa(
    recompensa_id: int,
    admin=Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    """Remove do catalogo.

    Desativa em vez de apagar: se algum usuario ja resgatou esse premio, apagar a
    linha quebraria o historico. Use PATCH com ativa=false para pausar.
    """
    result = (
        supabase.table("catalogo_recompensas")
        .update({"ativa": False})
        .eq("id", recompensa_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Recompensa nao encontrada")
    return {"id": recompensa_id, "ativa": False}


@router.get("/users")
async def get_users(
    sexo: Optional[str] = Query(None),
    idade_min: Optional[int] = Query(None),
    idade_max: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin=Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    query = supabase.table("usuarios").select("id,nome,email,cpf,sexo,idade,tipo,criado_em,pontos").order("criado_em", desc=True)

    if sexo:
        query = query.eq("sexo", sexo)
    if idade_min is not None:
        query = query.gte("idade", idade_min)
    if idade_max is not None:
        query = query.lte("idade", idade_max)

    count_query = supabase.table("usuarios").select("*", count="exact")
    if sexo:
        count_query = count_query.eq("sexo", sexo)
    if idade_min is not None:
        count_query = count_query.gte("idade", idade_min)
    if idade_max is not None:
        count_query = count_query.lte("idade", idade_max)

    query = query.range((page - 1) * limit, page * limit - 1)
    result = query.execute()
    total_result = count_query.execute()

    return {
        "data": result.data,
        "total": total_result.count,
        "page": page,
        "limit": limit,
    }


@router.get("/stats")
async def get_stats(
    admin=Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    usuarios_result = supabase.table("usuarios").select("id,sexo,idade,pontos").execute()
    users = usuarios_result.data or []

    total_usuarios = len(users)

    reciclagens_result = (
        supabase.table("reciclagens")
        .select("usuario_id")
        .eq("status", "validada")
        .execute()
    )
    validadas = reciclagens_result.data
    total_tags_validadas = len(validadas)

    tags_by_user: dict = {}
    for r in validadas:
        uid = r.get("usuario_id")
        tags_by_user[uid] = tags_by_user.get(uid, 0) + 1

    sexo_count = {"masculino": 0, "feminino": 0, "outro": 0, "nao_informado": 0}
    age_ranges = {"18-25": 0, "26-35": 0, "36-45": 0, "46-55": 0, "56+": 0}
    total_pontos = 0

    for u in users:
        n = tags_by_user.get(u["id"], 0)
        s = (u.get("sexo") or "").lower()
        if s in ("masculino", "feminino", "outro"):
            sexo_count[s] += n
        else:
            sexo_count["nao_informado"] += n

        idade = u.get("idade")
        if idade:
            if 18 <= idade <= 25:
                age_ranges["18-25"] += n
            elif 26 <= idade <= 35:
                age_ranges["26-35"] += n
            elif 36 <= idade <= 45:
                age_ranges["36-45"] += n
            elif 46 <= idade <= 55:
                age_ranges["46-55"] += n
            elif idade >= 56:
                age_ranges["56+"] += n

        total_pontos += u.get("pontos", 0)

    return {
        "total_usuarios": total_usuarios,
        "total_tags_validadas": total_tags_validadas,
        "total_pontos": total_pontos,
        "por_sexo": sexo_count,
        "por_faixa_etaria": age_ranges,
    }


@router.get("/users/tags")
async def get_users_tags(
    sexo: Optional[str] = Query(None),
    idade_min: Optional[int] = Query(None),
    idade_max: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin=Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    query = supabase.table("usuarios").select("id,nome,email,cpf,sexo,idade,tipo,criado_em,pontos").order("criado_em", desc=True)

    if sexo:
        query = query.eq("sexo", sexo)
    if idade_min is not None:
        query = query.gte("idade", idade_min)
    if idade_max is not None:
        query = query.lte("idade", idade_max)

    query = query.range((page - 1) * limit, page * limit - 1)

    count_query = supabase.table("usuarios").select("*", count="exact")
    if sexo:
        count_query = count_query.eq("sexo", sexo)
    if idade_min is not None:
        count_query = count_query.gte("idade", idade_min)
    if idade_max is not None:
        count_query = count_query.lte("idade", idade_max)

    result = query.execute()
    total_result = count_query.execute()

    usuarios_ids = set(u["id"] for u in (result.data or []))
    reciclagens_result = (
        supabase.table("reciclagens")
        .select("usuario_id")
        .eq("status", "validada")
        .in_("usuario_id", list(usuarios_ids))
        .execute()
    )

    tags_count: dict[int, int] = {}
    for r in reciclagens_result.data:
        uid = r.get("usuario_id")
        tags_count[uid] = tags_count.get(uid, 0) + 1

    for u in result.data:
        u["tags_validadas"] = tags_count.get(u["id"], 0)

    return {
        "data": result.data,
        "total": total_result.count,
        "page": page,
        "limit": limit,
    }


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_admin(
    data: AdminCreate,
    admin=Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    email = data.email.strip().lower()
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        raise HTTPException(status_code=400, detail="E-mail invalido")

    try:
        usuario = create_admin_usuario(supabase, data.nome, email, data.senha)
    except AdminCreationError as err:
        raise HTTPException(status_code=err.status_code, detail=err.message)

    grant_welcome_achievement(supabase, usuario["id"])

    pontos = get_user_points(supabase, usuario["id"])
    supabase.table("usuarios").update({"pontos": pontos}).eq("id", usuario["id"]).execute()

    return {
        "id": usuario["id"],
        "nome": usuario["nome"],
        "email": usuario["email"],
        "tipo": usuario["tipo"],
        "criado_em": usuario.get("criado_em"),
        "pontos": pontos,
        "household_size": usuario.get("household_size", 1),
    }


@router.get("/users/{usuario_id}")
async def get_user_detail(
    usuario_id: int,
    admin=Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    usuario_result = (
        supabase.table("usuarios")
        .select("id,nome,email,cpf,sexo,idade,tipo,criado_em,pontos,household_size")
        .eq("id", usuario_id)
        .limit(1)
        .execute()
    )

    if not usuario_result.data:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")

    usuario = usuario_result.data[0]
    pontos = get_user_points(supabase, usuario_id)

    reciclagens = (
        supabase.table("reciclagens")
        .select("id,status,data_entrega,data_confirmacao,tags(id,codigo_nfc,status)")
        .eq("usuario_id", usuario_id)
        .order("data_entrega", desc=True)
        .execute()
    ).data or []

    validadas = [r for r in reciclagens if r.get("status") == "validada"]
    tags_ids = {r["tags"]["id"] for r in reciclagens if r.get("tags")}
    impact = calculate_impact(len(validadas))

    conquistas = (
        supabase.table("usuario_conquistas")
        .select("id,conquista_codigo,pontos_ganhos,concedida_em,resgatada_em")
        .eq("usuario_id", usuario_id)
        .order("concedida_em", desc=True)
        .execute()
    ).data or []

    return {
        "id": usuario["id"],
        "nome": usuario["nome"],
        "email": usuario["email"],
        "cpf": usuario.get("cpf"),
        "sexo": usuario.get("sexo"),
        "idade": usuario.get("idade"),
        "tipo": usuario.get("tipo", "cliente"),
        "criado_em": usuario.get("criado_em"),
        "pontos": pontos,
        "pontos_armazenados": usuario.get("pontos", 0),
        "household_size": usuario.get("household_size", 1),
        "entregas": impact["validated_count"],
        "arvores": impact["trees"],
        "co2_kg": impact["co2_kg"],
        "water_liters": impact["water_liters"],
        "kg_reciclado": impact["kg_reciclado"],
        "tags_count": len(tags_ids),
        "total_usos": len(reciclagens),
        "tags": [
            {
                "id": r["tags"]["id"],
                "codigo_nfc": r["tags"]["codigo_nfc"],
                "status": r["tags"]["status"],
                "reciclagem_status": r.get("status"),
                "data_entrega": r.get("data_entrega"),
                "data_confirmacao": r.get("data_confirmacao"),
            }
            for r in reciclagens
            if r.get("tags")
        ],
        "conquistas": conquistas,
    }


@router.get("/tags")
async def list_tags(
    admin=Depends(get_admin_user),
    supabase: Client = Depends(get_supabase),
):
    tags_result = (
        supabase.table("tags")
        .select("id,codigo_nfc,status")
        .order("codigo_nfc")
        .execute()
    )
    tags = tags_result.data or []

    reciclagens: list[dict] = []
    if tags:
        reciclagens = (
            supabase.table("reciclagens")
            .select("id,tag_id,usuario_id,status,data_entrega,data_confirmacao")
            .in_("tag_id", [t["id"] for t in tags])
            .execute()
        ).data or []

    usuarios_ids = {r["usuario_id"] for r in reciclagens if r.get("usuario_id")}
    nomes: dict = {}
    if usuarios_ids:
        usuarios_result = (
            supabase.table("usuarios").select("id,nome").in_("id", list(usuarios_ids)).execute()
        )
        nomes = {u["id"]: u["nome"] for u in usuarios_result.data or []}

    por_tag: dict[int, list[dict]] = {}
    for r in reciclagens:
        por_tag.setdefault(r["tag_id"], []).append(r)

    data = []
    for tag in tags:
        historico = por_tag.get(tag["id"], [])
        validadas = [r for r in historico if r.get("status") == "validada"]
        pendentes = [r for r in historico if r.get("status") == "pendente"]
        ultima = max(historico, key=lambda r: r.get("data_entrega") or "", default=None)

        if pendentes:
            situacao = "aguardando"
        elif validadas:
            situacao = "validada"
        else:
            situacao = "nunca_usada"

        data.append(
            {
                "id": tag["id"],
                "codigo_nfc": tag["codigo_nfc"],
                "status": tag["status"],
                "situacao": situacao,
                "total_usos": len(historico),
                "pessoas": len({r["usuario_id"] for r in historico if r.get("usuario_id")}),
                "validacoes": len(validadas),
                "pendentes": len(pendentes),
                "pode_validar": len(pendentes) > 0,
                "ultima_utilizacao": (ultima or {}).get("data_entrega"),
                "ultimo_usuario": nomes.get((ultima or {}).get("usuario_id")),
                "ultima_validacao": max(
                    (r.get("data_confirmacao") for r in validadas if r.get("data_confirmacao")),
                    default=None,
                ),
            }
        )

    return {
        "data": data,
        "total": len(data),
        "aguardando": sum(1 for t in data if t["situacao"] == "aguardando"),
        "validadas": sum(1 for t in data if t["situacao"] == "validada"),
        "nunca_usadas": sum(1 for t in data if t["situacao"] == "nunca_usada"),
    }


@router.post("/validate-tag")
async def validate_tag(
    payload: dict,
    staff=Depends(get_staff_user),
    supabase: Client = Depends(get_supabase),
):
    codigo = payload.get("codigo_nfc", "").strip().upper()
    if not codigo:
        raise HTTPException(status_code=400, detail="codigo_nfc e obrigatorio")

    result = (
        supabase.table("tags")
        .select("*")
        .eq("codigo_nfc", codigo)
        .execute()
    )

    if not result.data:
        return {"valid": False, "message": "Tag nao encontrada"}

    tag = result.data[0]

    reciclagens = (
        supabase.table("reciclagens")
        .select("id, usuario_id, status")
        .eq("tag_id", tag["id"])
        .eq("status", "pendente")
        .execute()
    )
    now = datetime.now(timezone.utc).isoformat()
    validated_count = 0
    validated_users = set()
    for r in reciclagens.data or []:
        updated = (
            supabase.table("reciclagens")
            .update(
                {
                    "status": "validada",
                    "data_confirmacao": now,
                    "funcionario_id": staff["id"],
                }
            )
            .eq("id", r["id"])
            .neq("status", "validada")
            .execute()
        )
        if not updated.data:
            continue
        validated_count += 1
        validated_users.add(r.get("usuario_id"))
        reward = (
            supabase.table("recompensas")
            .select("*")
            .eq("reciclagem_id", r["id"])
            .limit(1)
            .execute()
        )
        if reward.data:
            supabase.table("recompensas").update(
                {
                    "usuario_id": r.get("usuario_id"),
                    "status": "liberada",
                    "data_liberacao": now,
                }
            ).eq("id", reward.data[0]["id"]).execute()
        else:
            supabase.table("recompensas").insert(
                {
                    "usuario_id": r.get("usuario_id"),
                    "reciclagem_id": r["id"],
                    "tipo": "pontos",
                    "valor": 10,
                    "status": "liberada",
                    "data_liberacao": now,
                }
            ).execute()

    for usuario_id in validated_users:
        if usuario_id is None:
            continue
        pontos = get_user_points(supabase, usuario_id)
        supabase.table("usuarios").update({"pontos": pontos}).eq("id", usuario_id).execute()

    if tag.get("status") != "disponivel":
        supabase.table("tags").update({"status": "disponivel"}).eq("id", tag["id"]).execute()
        tag["status"] = "disponivel"

    return {
        "valid": True,
        "tag": tag,
        "message": "Tag validada e liberada",
        "reciclagens_validadas": validated_count,
    }
