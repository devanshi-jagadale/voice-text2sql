import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def explain_result(query: str, results: list) -> str:
    if not results:
        return "The query returned no results."

    prompt = f"""User asked: "{query}"

Query results: {results[:10]}

Explain this in 2-3 plain English sentences with key insights. Be concise and specific."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content.strip()