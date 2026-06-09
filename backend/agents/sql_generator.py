import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_sql(nl_query: str, schema_context: str) -> str:
    prompt = f"""You are a PostgreSQL expert.

Schema:
{schema_context}

Convert this to a valid PostgreSQL query: {nl_query}

Rules:
- Use ILIKE instead of LIKE for text comparisons
- Use LOWER() on both sides for equality checks on text columns e.g. LOWER(department) = LOWER('Engineering')
- Return only the SQL query, nothing else. No markdown, no explanation."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()