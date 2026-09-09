from supabase import Client


def get_user_points(supabase: Client, usuario_id: int) -> int:
    recicl = (
        supabase.table("reciclagens")
        .select("id")
        .eq("usuario_id", usuario_id)
        .execute()
    )
    if not recicl.data:
        return 0

    recic_ids = [r["id"] for r in recicl.data]

    total = 0
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

    return total
