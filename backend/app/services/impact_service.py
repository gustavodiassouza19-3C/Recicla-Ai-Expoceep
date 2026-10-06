"""Impacto ambiental por entrega validada.

Unica fonte de verdade dos numeros de impacto. O dashboard, o perfil, a
pagina de recompensas e o painel admin leem daqui (via /api/recycle/impact e
/api/admin/users/{id}), entao as telas param de mostrar contas diferentes.

Premissas do prototipo -- nao sao medicoes diretas, e a arquitetura deixa os
fatores isolados aqui para trocar por metodologia validada depois:

- 1 entrega validada ~= 1 kg de material reciclavel coletado no ponto.
- arvores: 0.004 por entrega, ou seja 1 arvore equivalente a cada 250
  entregas. Fator ja usado pelo app antes desta unificacao, mantido para nao
  mudar os numeros que ja existiam.
- agua: 8 L por entrega (idem, fator pre-existente).
- co2: 1.5 kg CO2e evitados por kg de material reciclado no lugar de material
  virgem -- ordem de grandeza usual para papel/plastico misto. O app nao tinha
  nenhum fator de CO2 por entrega: o unico CO2 que aparecia vinha do numero de
  moradores, que nao tem relacao com o que a pessoa reciclou.
"""

ARVORES_POR_ENTREGA = 0.004
AGUA_L_POR_ENTREGA = 8.0
KG_POR_ENTREGA = 1.0
CO2_KG_POR_ENTREGA = 1.5


def calculate_impact(validated_count: int) -> dict:
    n = max(0, int(validated_count or 0))
    return {
        "validated_count": n,
        "trees": round(n * ARVORES_POR_ENTREGA, 4),
        "water_liters": round(n * AGUA_L_POR_ENTREGA, 1),
        "co2_kg": round(n * CO2_KG_POR_ENTREGA, 2),
        "kg_reciclado": round(n * KG_POR_ENTREGA, 1),
    }
