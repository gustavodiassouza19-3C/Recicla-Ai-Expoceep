from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from app.database import get_supabase
from app.auth import get_current_user
from app.models.recycling import RecyclingCreate, RecyclingValidate
from app.services.tag_service import validate_tag_code
from app.services.points_service import get_user_points, get_user_points_ledger
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

# Enquadramento do eixo X. Sao 12 pontos: 3 meses de historico, o mes atual e 8
# meses a frente. Antes a janela terminava no mes atual, entao "agora" ficava
# colado na borda direita e a curva parecia cortada ali. Estendendo para a
# frente, o mes corrente cai para dentro da area util e a direita passa a
# mostrar quanto ainda tem de ano pela frente.
MESES_ANTES = 3
MESES_DEPOIS = 8


@router.get("/score-history")
async def get_score_history(
    user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase),
):
    """Saldo acumulado de pontos mes a mes, enquadrado em MESES_ANTES/DEPOIS.

    A serie e ACUMULADA, nao a pontos-por-mes. Com pontos-por-mes o grafico
    mostrava o maior credito de um mes (1810) enquanto a tela mostrava o saldo
    total (2960): o mesmo usuario, dois numeros, e o grafico parecia errado.
    Sendo acumulado, o ponto do mes corrente e por definicao o saldo real.

    A fonte e o ledger (recompensas + conquistas resgatadas), e nao
    `quantidade de reciclagens x constante`: multiplicar por constante ignora
    os pontos de conquista, que sao a maior parte do saldo.

    O primeiro ponto ja nasce com o saldo anterior a janela, senao a curva
    comecaria em zero e perderia tudo que o usuario acumulou antes dela.

    Os meses a frente do atual repetem o saldo corrente. A curva nao volta a
    zero nem para no meio: a linha segue reta na altura do total ate o fim do
    eixo, entao o grafico continua legivel como "onde eu estou".
    """
    # Fonte unica do ledger: recompensa (tipo pontos/missao liberada) +
    # conquistas resgatadas. Assim grafico e saldo nunca divergem.
    eventos = get_user_points_ledger(supabase, user["id"])

    hoje = datetime.now(timezone.utc)
    # Chave (ano, mes) do primeiro mes da janela, MESES_ANTES meses atras.
    total_mes_inicial = hoje.month - MESES_ANTES
    ano_inicial = hoje.year + (total_mes_inicial - 1) // 12
    mes_inicial = (total_mes_inicial - 1) % 12 + 1
    inicio_janela = (ano_inicial, mes_inicial)

    por_mes: dict[tuple[int, int], int] = {}
    saldo_anterior = 0
    for quando, valor in eventos:
        chave = (quando.year, quando.month)
        por_mes[chave] = por_mes.get(chave, 0) + valor
        if chave < inicio_janela:
            saldo_anterior += valor

    serie = []
    saldo = saldo_anterior
    for deslocamento in range(MESES_ANTES, -MESES_DEPOIS - 1, -1):
        # O indice do mes e derivado do MES que este no calendario, nao da
        # posicao na serie. Misturar os dois da duas series invertidas:
        # usar `hoje.month + deslocamento` com deslocamento negativo jogava
        # todo mes futuro para o MES anterior (Set caia em Out), e rotular pelo
        # offset invertia a ordem inteira do eixo X. So o calendario local
        # (11 -> Out, 10 -> Set) respeita a sequencia que o grafico mostra.
        total_mes = hoje.month - deslocamento
        ano = hoje.year + (total_mes - 1) // 12
        mes = (total_mes - 1) % 12 + 1

        # Meses a frente do atual mantem o saldo como esta: nao ha nada a
        # somar, entao a curva continua reta na altura do total ate o fim do
        # eixo. So os meses ja vividos somam -- assim um evento com data
        # futura (horario mal gravado, por exemplo) nao inflaria a curva.
        if deslocamento >= 0:
            saldo += por_mes.get((ano, mes), 0)

        serie.append(
            {
                "month": MESES_PT[mes - 1],
                "score": saldo,
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
