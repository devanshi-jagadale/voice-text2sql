import matplotlib
matplotlib.use("Agg")  # non-interactive backend, no display needed
import matplotlib.pyplot as plt
import os, time

def generate_chart(results: list, query: str) -> str | None:
    if not results or len(results) < 2:
        return None

    sample = results[0]
    numeric_cols = [k for k, v in sample.items() if isinstance(v, (int, float)) and k != "id"]
    label_cols = [k for k, v in sample.items() if isinstance(v, str)]

    if not numeric_cols:
        return None

    label_col = label_cols[0] if label_cols else None
    value_col = numeric_cols[0]

    labels = [str(r.get(label_col, i)) for i, r in enumerate(results)] if label_col else [str(i) for i in range(len(results))]
    values = [r[value_col] for r in results]

    fig, ax = plt.subplots(figsize=(10, 5))
    bars = ax.bar(labels, values, color="#4f8ef7")
    ax.set_xlabel(label_col or "Row")
    ax.set_ylabel(value_col)
    ax.set_title(query[:60])
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()

    filename = f"chart_{int(time.time())}.png"
    path = os.path.join("static", "images", filename)
    plt.savefig(path)
    plt.close()

    return filename