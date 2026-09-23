from supabase import Client
from datetime import datetime, timedelta, timezone
from typing import Optional


def get_user_achievements(supabase: Client, usuario_id: int) -> list[dict]:
    result = (
        supabase.table("usuario_conquistas")
        .select("*")
        .eq("usuario_id", usuario_id)
        .execute()
    )
    return result.data or []


def get_all_achievements(supabase: Client) -> list[dict]:
    result = (
        supabase.table("conquistas")
        .select("*")
        .eq("ativa", True)
        .order("id")
        .execute()
    )
    return result.data or []


def get_total_tags(supabase: Client, usuario_id: int) -> int:
    result = (
        supabase.table("reciclagens")
        .select("id", count="exact")
        .eq("usuario_id", usuario_id)
        .execute()
    )
    return result.count or 0


def get_total_points(supabase: Client, usuario_id: int) -> int:
    from app.services.points_service import get_user_points
    return get_user_points(supabase, usuario_id)


def get_consecutive_days(supabase: Client, usuario_id: int) -> int:
    result = (
        supabase.table("reciclagens")
        .select("data_entrega")
        .eq("usuario_id", usuario_id)
        .order("data_entrega", desc=True)
        .execute()
    )
    if not result.data:
        return 0

    dates = []
    for r in result.data:
        if r["data_entrega"]:
            try:
                dt = datetime.fromisoformat(r["data_entrega"].replace("Z", "+00:00"))
                dates.append(dt.date())
            except (ValueError, TypeError):
                continue

    if not dates:
        return 0

    unique_dates = sorted(set(dates), reverse=True)
    today = datetime.now(timezone.utc).date()

    consecutive = 0
    check_date = today

    for d in unique_dates:
        if d == check_date:
            consecutive += 1
            check_date -= timedelta(days=1)
        elif d == check_date - timedelta(days=1):
            consecutive += 1
            check_date = d
        else:
            break

    return consecutive


def get_consecutive_weeks(supabase: Client, usuario_id: int) -> int:
    result = (
        supabase.table("reciclagens")
        .select("data_entrega")
        .eq("usuario_id", usuario_id)
        .order("data_entrega", desc=True)
        .execute()
    )
    if not result.data:
        return 0

    weeks = set()
    for r in result.data:
        if r["data_entrega"]:
            try:
                dt = datetime.fromisoformat(r["data_entrega"].replace("Z", "+00:00"))
                iso_year, iso_week, _ = dt.isocalendar()
                weeks.add((iso_year, iso_week))
            except (ValueError, TypeError):
                continue

    if not weeks:
        return 0

    sorted_weeks = sorted(weeks, reverse=True)
    today = datetime.now(timezone.utc).date()
    current_year, current_week, _ = today.isocalendar()

    consecutive = 0
    expected_year, expected_week = current_year, current_week

    for year, week in sorted_weeks:
        if year == expected_year and week == expected_week:
            consecutive += 1
            expected_week -= 1
            if expected_week < 1:
                expected_year -= 1
                expected_week = 52
        else:
            break

    return consecutive


def get_consecutive_months(supabase: Client, usuario_id: int) -> int:
    result = (
        supabase.table("reciclagens")
        .select("data_entrega")
        .eq("usuario_id", usuario_id)
        .order("data_entrega", desc=True)
        .execute()
    )
    if not result.data:
        return 0

    months = set()
    for r in result.data:
        if r["data_entrega"]:
            try:
                dt = datetime.fromisoformat(r["data_entrega"].replace("Z", "+00:00"))
                months.add((dt.year, dt.month))
            except (ValueError, TypeError):
                continue

    if not months:
        return 0

    sorted_months = sorted(months, reverse=True)
    today = datetime.now(timezone.utc)
    expected_year, expected_month = today.year, today.month

    consecutive = 0
    for year, month in sorted_months:
        if year == expected_year and month == expected_month:
            consecutive += 1
            expected_month -= 1
            if expected_month < 1:
                expected_year -= 1
                expected_month = 12
        else:
            break

    return consecutive


def get_participation_months(supabase: Client, usuario_id: int) -> int:
    result = (
        supabase.table("reciclagens")
        .select("data_entrega")
        .eq("usuario_id", usuario_id)
        .order("data_entrega", desc=True)
        .execute()
    )
    if not result.data:
        return 0

    months = set()
    for r in result.data:
        if r["data_entrega"]:
            try:
                dt = datetime.fromisoformat(r["data_entrega"].replace("Z", "+00:00"))
                months.add((dt.year, dt.month))
            except (ValueError, TypeError):
                continue

    return len(months)


def get_total_participations(supabase: Client, usuario_id: int) -> int:
    return get_total_tags(supabase, usuario_id)


def get_tags_in_short_time(supabase: Client, usuario_id: int, hours: int = 2) -> int:
    result = (
        supabase.table("reciclagens")
        .select("data_entrega")
        .eq("usuario_id", usuario_id)
        .order("data_entrega", desc=True)
        .limit(10)
        .execute()
    )
    if not result.data or len(result.data) < 2:
        return 0

    dates = []
    for r in result.data:
        if r["data_entrega"]:
            try:
                dt = datetime.fromisoformat(r["data_entrega"].replace("Z", "+00:00"))
                dates.append(dt)
            except (ValueError, TypeError):
                continue

    if len(dates) < 2:
        return 0

    max_count = 1
    current_count = 1
    for i in range(len(dates) - 1):
        diff = (dates[i] - dates[i + 1]).total_seconds() / 3600
        if diff <= hours:
            current_count += 1
            max_count = max(max_count, current_count)
        else:
            current_count = 1

    return max_count


def get_tags_in_week(supabase: Client, usuario_id: int) -> int:
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=today.weekday())

    result = (
        supabase.table("reciclagens")
        .select("data_entrega")
        .eq("usuario_id", usuario_id)
        .gte("data_entrega", week_start.isoformat())
        .execute()
    )
    return len(result.data) if result.data else 0


def has_perfect_week(supabase: Client, usuario_id: int) -> bool:
    today = datetime.now(timezone.utc).date()
    week_start = today - timedelta(days=today.weekday())

    result = (
        supabase.table("reciclagens")
        .select("data_entrega")
        .eq("usuario_id", usuario_id)
        .gte("data_entrega", week_start.isoformat())
        .execute()
    )
    if not result.data:
        return False

    days_with_participation = set()
    for r in result.data:
        if r["data_entrega"]:
            try:
                dt = datetime.fromisoformat(r["data_entrega"].replace("Z", "+00:00"))
                days_with_participation.add(dt.date())
            except (ValueError, TypeError):
                continue

    for i in range(7):
        check_date = week_start + timedelta(days=i)
        if check_date > today:
            break
        if check_date not in days_with_participation:
            return False

    return True


def has_frequency_increase(supabase: Client, usuario_id: int) -> bool:
    today = datetime.now(timezone.utc).date()
    this_month_start = today.replace(day=1)
    last_month_end = this_month_start - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)

    this_month = (
        supabase.table("reciclagens")
        .select("id", count="exact")
        .eq("usuario_id", usuario_id)
        .gte("data_entrega", this_month_start.isoformat())
        .execute()
    )
    last_month = (
        supabase.table("reciclagens")
        .select("id", count="exact")
        .eq("usuario_id", usuario_id)
        .gte("data_entrega", last_month_start.isoformat())
        .lt("data_entrega", this_month_start.isoformat())
        .execute()
    )

    return (this_month.count or 0) > (last_month.count or 0)


def has_frequency_increase_periods(supabase: Client, usuario_id: int, periods: int = 2) -> bool:
    today = datetime.now(timezone.utc).date()
    counts = []

    for i in range(periods + 1):
        month_start = (today.replace(day=1)) - timedelta(days=30 * i)
        month_end = month_start + timedelta(days=30)
        result = (
            supabase.table("reciclagens")
            .select("id", count="exact")
            .eq("usuario_id", usuario_id)
            .gte("data_entrega", month_start.isoformat())
            .lt("data_entrega", month_end.isoformat())
            .execute()
        )
        counts.append(result.count or 0)

    increasing = all(counts[i] > counts[i + 1] for i in range(periods))
    return increasing


def has_commitment_kept(supabase: Client, usuario_id: int) -> bool:
    consecutive = get_consecutive_days(supabase, usuario_id)
    return consecutive >= 7


def get_total_earned_achievements(supabase: Client, usuario_id: int) -> int:
    result = (
        supabase.table("usuario_conquistas")
        .select("id", count="exact")
        .eq("usuario_id", usuario_id)
        .execute()
    )
    return result.count or 0


def get_pending_achievements(supabase: Client, usuario_id: int) -> list[dict]:
    result = (
        supabase.table("usuario_conquistas")
        .select("*")
        .eq("usuario_id", usuario_id)
        .is_("resgatada_em", "null")
        .order("concedida_em", desc=True)
        .execute()
    )
    rows = result.data or []
    if not rows:
        return []

    codes = [r["conquista_codigo"] for r in rows]
    catalog = (
        supabase.table("conquistas")
        .select("*")
        .in_("codigo", codes)
        .execute()
    )
    by_code = {c["codigo"]: c for c in (catalog.data or [])}

    pending = []
    for row in rows:
        meta = by_code.get(row["conquista_codigo"])
        if not meta:
            continue
        pending.append(
            {
                "usuario_conquista_id": row["id"],
                "codigo": row["conquista_codigo"],
                "nome": meta["nome"],
                "descricao": meta["descricao"],
                "icone": meta["icone"],
                "pontos": int(row.get("pontos_ganhos") or meta.get("pontos") or 0),
                "categoria": meta.get("categoria"),
                "concedida_em": row.get("concedida_em"),
            }
        )
    return pending


def check_achievements(supabase: Client, usuario_id: int) -> dict:
    all_achievements = get_all_achievements(supabase)
    user_achievements = get_user_achievements(supabase, usuario_id)
    earned_codes = {a["conquista_codigo"] for a in user_achievements}

    total_tags = get_total_tags(supabase, usuario_id)
    total_points = get_total_points(supabase, usuario_id)
    consecutive_days = get_consecutive_days(supabase, usuario_id)
    consecutive_weeks = get_consecutive_weeks(supabase, usuario_id)
    consecutive_months = get_consecutive_months(supabase, usuario_id)
    participation_months = get_participation_months(supabase, usuario_id)
    total_participations = get_total_participations(supabase, usuario_id)
    tags_in_short_time = get_tags_in_short_time(supabase, usuario_id, hours=2)
    tags_in_week = get_tags_in_week(supabase, usuario_id)
    perfect_week = has_perfect_week(supabase, usuario_id)
    frequency_increase = has_frequency_increase(supabase, usuario_id)
    frequency_increase_2 = has_frequency_increase_periods(supabase, usuario_id, 2)
    commitment_kept = has_commitment_kept(supabase, usuario_id)

    new_achievements = []

    for achievement in all_achievements:
        code = achievement["codigo"]
        if code in earned_codes:
            continue

        condition_type = achievement["condicao_tipo"]
        condition_value = achievement["condicao_valor"]
        earned = False

        if condition_type == "total_tags":
            earned = total_tags >= condition_value
        elif condition_type == "sequencia_dias":
            earned = consecutive_days >= condition_value
        elif condition_type == "semanas_consecutivas":
            earned = consecutive_weeks >= condition_value
        elif condition_type == "meses_consecutivos":
            earned = consecutive_months >= condition_value
        elif condition_type == "total_pontos":
            earned = total_points >= condition_value
        elif condition_type == "tags_rapidas":
            earned = tags_in_short_time >= condition_value
        elif condition_type == "alta_frequencia":
            earned = tags_in_week >= condition_value
        elif condition_type == "semana_perfeita":
            earned = perfect_week
        elif condition_type == "em_evolucao":
            earned = frequency_increase
        elif condition_type == "novo_ritmo":
            earned = frequency_increase_2
        elif condition_type == "compromisso_mantido":
            earned = commitment_kept
        elif condition_type == "meses_participacao":
            earned = participation_months >= condition_value
        elif condition_type == "total_participacoes":
            earned = total_participations >= condition_value
        elif condition_type == "total_conquistas":
            earned = len(earned_codes) >= condition_value

        if earned:
            supabase.table("usuario_conquistas").insert(
                {
                    "usuario_id": usuario_id,
                    "conquista_id": achievement["id"],
                    "conquista_codigo": code,
                    "pontos_ganhos": achievement["pontos"],
                }
            ).execute()
            earned_codes.add(code)

            new_achievements.append(
                {
                    "codigo": code,
                    "nome": achievement["nome"],
                    "descricao": achievement["descricao"],
                    "icone": achievement["icone"],
                    "pontos": achievement["pontos"],
                }
            )

    pontos_ganhos_total = sum(a["pontos"] for a in new_achievements)

    return {
        "novas_conquistas": new_achievements,
        "pontos_ganhos_total": pontos_ganhos_total,
    }


def get_user_achievement_progress(supabase: Client, usuario_id: int) -> list[dict]:
    all_achievements = get_all_achievements(supabase)
    user_achievements = get_user_achievements(supabase, usuario_id)
    earned_map = {a["conquista_codigo"]: a for a in user_achievements}

    total_tags = get_total_tags(supabase, usuario_id)
    total_points = get_total_points(supabase, usuario_id)
    consecutive_days = get_consecutive_days(supabase, usuario_id)
    consecutive_weeks = get_consecutive_weeks(supabase, usuario_id)
    consecutive_months = get_consecutive_months(supabase, usuario_id)
    participation_months = get_participation_months(supabase, usuario_id)
    total_participations = get_total_participations(supabase, usuario_id)
    tags_in_short_time = get_tags_in_short_time(supabase, usuario_id, hours=2)
    tags_in_week = get_tags_in_week(supabase, usuario_id)
    perfect_week = has_perfect_week(supabase, usuario_id)
    frequency_increase = has_frequency_increase(supabase, usuario_id)
    frequency_increase_2 = has_frequency_increase_periods(supabase, usuario_id, 2)
    commitment_kept = has_commitment_kept(supabase, usuario_id)
    total_earned = len(earned_map)

    progress_list = []

    for achievement in all_achievements:
        code = achievement["codigo"]
        condition_type = achievement["condicao_tipo"]
        condition_value = achievement["condicao_valor"]
        earned = code in earned_map

        current = 0
        if condition_type == "total_tags":
            current = total_tags
        elif condition_type == "sequencia_dias":
            current = consecutive_days
        elif condition_type == "semanas_consecutivas":
            current = consecutive_weeks
        elif condition_type == "meses_consecutivos":
            current = consecutive_months
        elif condition_type == "total_pontos":
            current = total_points
        elif condition_type == "tags_rapidas":
            current = tags_in_short_time
        elif condition_type == "alta_frequencia":
            current = tags_in_week
        elif condition_type == "semana_perfeita":
            current = 1 if perfect_week else 0
            condition_value = 1
        elif condition_type == "em_evolucao":
            current = 1 if frequency_increase else 0
            condition_value = 1
        elif condition_type == "novo_ritmo":
            current = 1 if frequency_increase_2 else 0
            condition_value = 1
        elif condition_type == "compromisso_mantido":
            current = 1 if commitment_kept else 0
            condition_value = 1
        elif condition_type == "meses_participacao":
            current = participation_months
        elif condition_type == "total_participacoes":
            current = total_participations
        elif condition_type == "total_conquistas":
            current = total_earned

        progress_list.append(
            {
                "conquista_codigo": code,
                "conquista_nome": achievement["nome"],
                "conquista_descricao": achievement["descricao"],
                "conquista_icone": achievement["icone"],
                "conquista_pontos": achievement["pontos"],
                "conquista_categoria": achievement["categoria"],
                "condicao_tipo": condition_type,
                "condicao_valor": condition_value,
                "progresso_atual": min(current, condition_value),
                "desbloqueada": earned,
                "data_concessao": earned_map[code]["concedida_em"] if earned else None,
                "resgatada": bool(earned_map[code].get("resgatada_em")) if earned else False,
                "pendente_resgate": earned and not bool(earned_map[code].get("resgatada_em")),
            }
        )

    return progress_list
