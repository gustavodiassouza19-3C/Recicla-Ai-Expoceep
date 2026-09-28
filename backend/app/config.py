from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: str = ""
    cors_origins: str = "http://localhost:3000"

    # Limite de reciclagens validadas por usuario por mes. 0 = sem limite.
    # Em teste fica 0; a regra comercial original era 5, e so precisa voltar
    # via env para reativar, sem mexer no codigo.
    limite_mensal_coletas: int = 0

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
