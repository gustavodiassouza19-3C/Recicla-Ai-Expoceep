from supabase import Client


def validate_tag_code(supabase: Client, tag_code: str) -> dict | None:
    result = (
        supabase.table("tags")
        .select("*")
        .eq("codigo_nfc", tag_code)
        .eq("status", "ativa")
        .execute()
    )
    if result.data:
        return result.data[0]
    return None
