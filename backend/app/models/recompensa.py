from typing import Optional

from pydantic import BaseModel, Field, field_validator


class RecompensaCreate(BaseModel):
    titulo: str = Field(min_length=2, max_length=120)
    descricao: str = Field(default="", max_length=500)
    custo_pontos: int = Field(gt=0, le=100_000)
    categoria: str = Field(default="parceiro")
    icone: Optional[str] = Field(default=None, max_length=8)
    ativa: bool = True

    @field_validator("titulo", "descricao")
    @classmethod
    def _strip(cls, value: str) -> str:
        return value.strip()

    @field_validator("categoria")
    @classmethod
    def _categoria_valida(cls, value: str) -> str:
        permitido = {"desconto", "parceiro", "doacao"}
        if value not in permitido:
            raise ValueError(f"categoria deve ser uma de: {', '.join(sorted(permitido))}")
        return value
