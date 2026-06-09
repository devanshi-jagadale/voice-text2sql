def decide_viz(results: list) -> bool:
    if not results or len(results) < 3:
        return False
    # Check if any numeric columns exist beyond id
    sample = results[0]
    numeric_cols = [
        k for k, v in sample.items()
        if isinstance(v, (int, float)) and k != "id"
    ]
    return len(numeric_cols) >= 1