from datetime import datetime, timezone

from supabase import Client


def get_user_points(supabase: Client, usuario_id: int) -> int:
    recicl = (
        supabase.table("reciclagens")
        .select("id")
        .eq("usuario_id", usuario_id)
        .execute()
    )

    total = 0
    if recicl.data:
        recic_ids = [r["id"] for r in recicl.data]
        for rid in recic_ids:
            rec = (
                supabase.table("recompensas")
                .select("valor")
                .eq("reciclagem_id", rid)
                .eq("tipo", "pontos")
                .eq("status", "liberada")
                .execute()
            )
            for r in rec.data:
                total += int(r["valor"])

    conquistas = (
        supabase.table("usuario_conquistas")
        .select("pontos_ganhos")
        .eq("usuario_id", usuario_id)
        .not_.is_("resgatada_em", "null")
        .execute()
    )
    for c in conquistas.data or []:
        total += int(c.get("pontos_ganhos") or 0)

    return total


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
