from functools import lru_cache

from supabase import create_client, Client
from app.config import settings


@lru_cache(maxsize=1)
def _supabase_client() -> Client:
    """Client unico reaproveitado por todas as requisicoes.

    `create_client` monta um pool HTTP proprio; criar um a cada request custava
    um handshake TLS novo antes de qualquer query. Com o cache, as conexoes com
    o Postgrest ficam vivas entre requisicoes.
    """
    return create_client(settings.supabase_url, settings.supabase_service_key)


@lru_cache(maxsize=1)
def _supabase_anon_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_supabase() -> Client:
    return _supabase_client()


def get_supabase_anon() -> Client:
    return _supabase_anon_client()
