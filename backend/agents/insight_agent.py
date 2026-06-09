import os
import statistics
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_insights(query: str, results: list) -> str | None:
    if not results or len(results) < 3:
        return None

    # Compute basic stats for numeric columns
    sample = results[0]
    numeric_cols = [k for k, v in sample.items() if isinstance(v, (int, float)) and k != "id"]

    if not numeric_cols:
        return None

    stats_summary = []
    outliers = []

    for col in numeric_cols:
        values = [r[col] for r in results if r[col] is not None]
        if len(values) < 3:
            continue

        mean = statistics.mean(values)
        stdev = statistics.stdev(values)
        col_min = min(values)
        col_max = max(values)

        stats_summary.append(
            f"{col}: mean={mean:.0f}, stdev={stdev:.0f}, min={col_min}, max={col_max}"
        )

        # Flag outliers (beyond 1.5 std from mean)
        for row in results:
            val = row.get(col)
            if val is not None and abs(val - mean) > 1.5 * stdev:
                label_col = next((k for k, v in row.items() if isinstance(v, str)), None)
                label = row[label_col] if label_col else "unknown"
                outliers.append(f"{label} has {col}={val} (mean is {mean:.0f})")

    if not stats_summary:
        return None

    prompt = f"""You are a data analyst. A user asked: "{query}"

Statistical summary of results:
{chr(10).join(stats_summary)}

Outliers detected:
{chr(10).join(outliers) if outliers else "None"}

Full results: {results[:15]}

Give 2-3 concise business insights from this data. Focus on:
- Anomalies or outliers worth flagging
- Comparisons between groups
- Trends or patterns

Be specific with numbers. Do not restate what the user asked. No bullet points — write as short sentences."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()