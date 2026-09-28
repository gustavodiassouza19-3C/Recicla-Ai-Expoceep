from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.database import get_supabase
from app.auth import get_current_user
from app.models.recycling import RecyclingCreate, RecyclingValidate
from app.services.tag_service import validate_tag_code
from app.services.points_service import get_user_points
from app.services.achievement_service import check_achievements
from app.config import settings
from datetime import datetime, timezone

router = APIRouter(prefix="/api/recycle", tags=["recycling"])

PONTOS_POR_RECICLAGEM = 10


def _count_monthly_recycles(supabase: Client, usuario_id: int) -> int:
    now = datetime.now(timezone.utc)
    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    result = (
        supabase.table("reciclagens")
        .select("id", count="exact")
        .eq("usuario_id", usuario_id)
        .eq("status", "validada")
        .gte("data_entrega", start.isoformat())
        .execute()
    )
    return result.count or 0


@router.post("", response_model=RecyclingValidate)
async def register_recycling(
    data: RecyclingCreate,
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    tag_code = data.tag_code.strip().upper()
    if not tag_code:
        raise HTTPException(status_code=400, detail="Informe o codigo da tag")

    tag = validate_tag_code(supabase, tag_code)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag invalida ou indisponivel")

    # Sem limite por padrao (ambiente de teste). A contagem so roda quando ha
    # limite configurado, entao nao custa uma query no caminho feliz.
    limite = settings.limite_mensal_coletas
    if limite > 0 and _count_monthly_recycles(supabase, user["id"]) >= limite:
        raise HTTPException(
            status_code=429,
            detail=f"Limite mensal de {limite} reciclagens atingido",
        )

    claimed = (
        supabase.table("tags")
        .update({"status": "em_uso"})
        .eq("id", tag["id"])
        .eq("status", "disponivel")
        .execute()
    )
    if not claimed.data:
        raise HTTPException(status_code=409, detail="Tag foi vinculada por outro usuario")

    try:
        result = (
            supabase.table("reciclagens")
            .insert(
                {
                    "usuario_id": user["id"],
                    "tag_id": tag["id"],
                    "data_entrega": datetime.now(timezone.utc).isoformat(),
                    "status": "pendente",
                }
            )
            .execute()
        )
        if not result.data:
            raise RuntimeError("Falha ao registrar reciclagem")
    except Exception:
        supabase.table("tags").update({"status": "disponivel"}).eq("id", tag["id"]).execute()
        raise HTTPException(status_code=500, detail="Nao foi possivel registrar a reciclagem")

    # Reavalia conquistas aqui. Sem isso o check so rodava quando o header do
    # dashboard remontava, ou seja, a conquista aparecia depois de recarregar.
    try:
        conquistas = check_achievements(supabase, user["id"])
    except Exception:
        conquistas = {"novas_conquistas": [], "pontos_ganhos_total": 0}

    return RecyclingValidate(
        success=True,
        pontos_ganhos=0,
        novo_total=get_user_points(supabase, user["id"]),
        message="Reciclagem registrada e aguardando validacao",
        conquistas_novas=conquistas["novas_conquistas"],
        pontos_conquistas=conquistas["pontos_ganhos_total"],
    )


@router.get("/history")
async def get_history(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = (
        supabase.table("reciclagens")
        .select("*, tags(codigo_nfc, status)")
        .eq("usuario_id", user["id"])
        .order("data_entrega", desc=True)
        .limit(50)
        .execute()
    )
    return result.data


# Abreviacoes em portugues. A serie precisa ser montada por indice de mes, nao
# por strftime("%b"), que devolve nome em ingles ("Sep") e nao casava com a lista
# pt-BR abaixo: o filtro posterior descartava o mes e o grafico voltava vazio.
MESES_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]


@router.get("/score-history")
async def get_score_history(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Serie de pontos por mes, da ultima janela de 12 meses.

    A fonte e o ledger real (recompensas + conquistas resgatadas), e nao
    `quantidade de reciclagens x 10`. Multiplicar por constante ignorava pontos
    de conquista, que sao a maior parte do saldo, e o grafico acabava
    mostrando uma fracao do que o usuario realmente tem.
    """
    recompensas = (
        supabase.table("recompensas")
        .select("valor", "data_liberacao")
        .eq("usuario_id", user["id"])
        .eq("status", "liberada")
        .execute()
    )
    conquistas = (
        supabase.table("usuario_conquistas")
        .select("pontos_ganhos", "resgatada_em")
        .eq("usuario_id", user["id"])
        .not_.is_("resgatada_em", "null")
        .execute()
    )

    por_mes: dict[tuple[int, int], int] = {}

    def somar(data_iso, valor):
        if not data_iso:
            return
        try:
            dt = datetime.fromisoformat(str(data_iso).replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return
        chave = (dt.year, dt.month)
        por_mes[chave] = por_mes.get(chave, 0) + int(valor or 0)

    for r in recompensas.data or []:
        somar(r.get("data_liberacao"), r.get("valor"))

    # Usa a data de resgate porque e ela que credita o saldo: e a mesma
    # condicao que get_user_points usa para contar a conquista.
    for c in conquistas.data or []:
        somar(c.get("resgatada_em"), c.get("pontos_ganhos"))

    hoje = datetime.now(timezone.utc)
    serie = []
    for deslocamento in range(11, -1, -1):
        total_mes = hoje.month - deslocamento
        ano = hoje.year + (total_mes - 1) // 12
        mes = (total_mes - 1) % 12 + 1
        serie.append(
            {
                "month": MESES_PT[mes - 1],
                "score": por_mes.get((ano, mes), 0),
            }
        )
    return serie


@router.get("/impact")
async def get_impact(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    result = (
        supabase.table("reciclagens")
        .select("id", count="exact")
        .eq("usuario_id", user["id"])
        .eq("status", "validada")
        .execute()
    )
    count = result.count or 0
    trees = round(count * 0.004, 4)
    water = count * 8
    return {"validated_count": count, "trees": trees, "water_liters": water}
