import os, json
from groq import Groq
from dotenv import load_dotenv
from db.metadata import get_schema_context

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def check_ambiguity(query: str) -> dict:
    schema = get_schema_context()
    
    prompt = f"""You are a query analyzer for a SQL system.

Available schema:
{schema}

Given this user query: "{query}"

Mark as ambiguous ONLY if the query has NO reference to any table, column, department, city, or metric from the schema whatsoever. Examples of truly vague: "show me data", "give me info", "what happened".

If the query mentions anything that could map to a table or column in the schema, mark it as NOT ambiguous.

Respond ONLY with valid JSON, no markdown:
{{"is_ambiguous": true/false, "clarifying_question": "question here or null"}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.choices[0].message.content.strip()
    try:
        return json.loads(text)
    except:
        return {"is_ambiguous": False, "clarifying_question": None}