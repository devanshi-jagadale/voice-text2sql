# VoiceQuery — Natural Language Analytics for Your Database

Ask questions about your database by voice or text. VoiceQuery transcribes speech, generates SQL, self-heals on failure, and proactively surfaces insights.

## Demo

🔗 [Live Demo](https://voice-text2sql.vercel.app)

---

## Architecture

```
Voice/Text → Ambiguity Check → SQL Generation → Execution
                                                      ↓
                                     Self-Healing (retry up to 3x)
                                                      ↓
                               Explanation → Insight Agent → Viz Decision
```

Built with LangGraph — each step is a node in a state graph with conditional edges, not a linear pipeline.

---

## What Makes It Agentic

| Feature | Why It's Agentic |
|---|---|
| Ambiguity detection | Stops and asks for clarification before generating bad SQL |
| Self-healing SQL | Reads the error, fixes the query, retries up to 3x |
| Insight agent | Proactively detects outliers and trends without being asked |
| Viz decision | Conditionally renders charts based on result shape |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Speech-to-Text | Groq Whisper-large-v3 |
| LLM | Groq Llama 3.3 70b |
| Agent Orchestration | LangGraph |
| Backend | FastAPI |
| Database | PostgreSQL (Supabase) |
| Frontend | React + Vite |
| Deploy | Render (BE) + Vercel (FE) |

---

## Features

- 🎤 **Voice input** via browser microphone — no setup needed
- 🔍 **Ambiguity resolution** — clarifies vague queries before generating SQL
- 🔧 **Self-healing SQL** — retries on failure with error context injected back into the LLM
- 💡 **Proactive insight generation** — flags outliers, trends, and anomalies automatically
- 📊 **Auto chart generation** — renders bar charts for numeric results
- 🗃️ **Chat history persistence** — all queries and results saved to PostgreSQL

---

## Project Structure

```
voice-text2sql/
├── backend/
│   ├── main.py                  # FastAPI app, endpoints
│   ├── graph/
│   │   ├── state.py             # LangGraph state definition
│   │   ├── nodes.py             # All agent node functions
│   │   ├── edges.py             # Conditional edge logic
│   │   └── pipeline.py          # Graph assembly
│   ├── agents/
│   │   ├── transcription.py     # Groq Whisper call
│   │   ├── ambiguity.py         # Ambiguity detection + clarification
│   │   ├── sql_generator.py     # NL → SQL with schema context
│   │   ├── executor.py          # PostgreSQL execution
│   │   ├── healer.py            # Self-healing retry loop
│   │   ├── explainer.py         # Result → plain English
│   │   ├── insight_agent.py     # Outlier + trend detection
│   │   └── viz_decider.py       # Decide chart vs text
│   ├── db/
│   │   ├── connection.py        # PostgreSQL connection
│   │   ├── metadata.py          # Schema loader
│   │   └── history.py           # Chat history persistence
│   └── requirements.txt
└── frontend/
    └── src/
        └── App.jsx
```

---

## Local Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:

```
GROQ_API_KEY=your_groq_key
DB_HOST=your_supabase_host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.yourprojectref
DB_PASSWORD=your_password
```

Run:

```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Update `API` in `src/App.jsx` to point to your backend URL.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/query-text` | Submit a text query |
| POST | `/query-voice` | Submit an audio file |
| GET | `/history` | Fetch recent query history |

### Example

```bash
curl -X POST http://localhost:8000/query-text \
  -H "Content-Type: application/json" \
  -d '{"query": "show me name and salary of all employees"}'
```

Response:
```json
{
  "sql": "SELECT name, salary FROM employees;",
  "results": [...],
  "explanation": "Salaries range from $52,000 to $112,000...",
  "insights": "Karan Singh's salary of 112,000 is significantly above the mean of 80,200...",
  "chart_url": "/static/images/chart_123.png"
}
```

---

## Deployment

- **Backend** → [Render](https://render.com) (free tier)
- **Frontend** → [Vercel](https://vercel.com)
- **Database** → [Supabase](https://supabase.com) (PostgreSQL, free tier)

Set all environment variables in Render's dashboard under Environment settings.

---
