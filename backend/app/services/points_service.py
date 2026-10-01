from datetime import datetime, timezone

from supabase import Client


def _parse_datetime(value) -> datetime | None:
    """Interpreta um timestamp do Postgres em datetime com fuso.

    O ledger precisa comparar eventos entre si, e misturar datetime com e sem
    fuso levanta TypeError na comparacao. Timestamps sem fuso sao tratados como
    UTC, que e o fuso em que o backend grava as datas de liberacao/resgate.
    """
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except (ValueError, TypeError):
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def get_user_points_ledger(supabase: Client, usuario_id: int) -> list[tuple[datetime, int]]:
    """Creditos de pontos do usuario, em ordem cronologica.

    Fonte unica da verdade: tanto o saldo (`get_user_points`) quanto a serie do
    grafico (`score-history`) saem daqui. Com os filtros duplicados em dois
    lugares, o grafico podia terminar exibindo um saldo diferente do numero
    mostrado na tela -- foi o que aconteceu quando `score-history` somava
    recompensa liberada sem o filtro de `tipo` que o saldo aplica.
    """
    rewards = (
        supabase.table("recompensas")
        .select("valor,data_liberacao")
        .eq("usuario_id", usuario_id)
        .in_("tipo", ["pontos", "missao"])
        .eq("status", "liberada")
        .execute()
    )
    conquistas = (
        supabase.table("usuario_conquistas")
        .select("pontos_ganhos,resgatada_em")
        .eq("usuario_id", usuario_id)
        .not_.is_("resgatada_em", "null")
        .execute()
    )

    eventos: list[tuple[datetime, int]] = []

    for reward in rewards.data or []:
        quando = _parse_datetime(reward.get("data_liberacao"))
        if quando is not None:
            eventos.append((quando, int(reward.get("valor") or 0)))

    # Usa a data de resgate porque e ela que credita o saldo: e a mesma
    # condicao que o filtro acima aplica sobre a conquista.
    for c in conquistas.data or []:
        quando = _parse_datetime(c.get("resgatada_em"))
        if quando is not None:
            eventos.append((quando, int(c.get("pontos_ganhos") or 0)))

    eventos.sort(key=lambda evento: evento[0])
    return eventos


def get_user_points(supabase: Client, usuario_id: int) -> int:
    return sum(valor for _, valor in get_user_points_ledger(supabase, usuario_id))


def claim_achievement_points(supabase: Client, usuario_id: int, conquista_codigo: str) -> dict:
    result = (
        supabase.table("usuario_conquistas")
        .select("*")
        .eq("usuario_id", usuario_id)
        .eq("conquista_codigo", conquista_codigo)
        .execute()
    )
    if not result.data:
        raise ValueError("Conquista nao encontrada")

    row = result.data[0]
    if row.get("resgatada_em"):
        raise ValueError("Conquista ja resgatada")

    now = datetime.now(timezone.utc).isoformat()
    supabase.table("usuario_conquistas").update(
        {"resgatada_em": now}
    ).eq("id", row["id"]).execute()

    pontos = int(row.get("pontos_ganhos") or 0)
    return {
        "codigo": conquista_codigo,
        "pontos": pontos,
        "pontos_totais": get_user_points(supabase, usuario_id),
        "resgatada_em": now,
    }
