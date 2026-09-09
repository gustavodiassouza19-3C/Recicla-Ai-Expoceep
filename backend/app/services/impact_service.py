def calculate_impact(recycling_count: int) -> dict:
    trees = recycling_count * 0.004
    water_liters = recycling_count * 8
    return {
        "trees": round(trees, 4),
        "water_liters": water_liters,
    }
