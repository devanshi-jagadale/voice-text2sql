import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def heal_sql(failed_sql: str, error: str, original_query: str, schema: str) -> str:
    prompt = f"""You are a PostgreSQL expert.

This SQL query failed:
{failed_sql}

Error: {error}

Original question: {original_query}

Schema:
{schema}

Fix the SQL. Return only the corrected SQL, no explanation, no markdown."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()