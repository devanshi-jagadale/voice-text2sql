from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from graph.pipeline import build_graph
from agents.chart_generator import generate_chart
from db.history import save_history, get_history
import tempfile, os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")

graph = build_graph()

@app.post("/query-text")
async def query_text(payload: dict):
    query = payload["query"]
    clarification = payload.get("clarification")

    initial_state = {
        "audio_path": None,
        "transcription": query,
        "is_ambiguous": None,
        "clarifying_question": None,
        "user_clarification": clarification,
        "final_query": query,
        "generated_sql": None,
        "is_valid": None,
        "execution_result": None,
        "error_message": None,
        "retry_count": 0,
        "explanation": None,
        "needs_viz": None,
    }

    result = graph.invoke(initial_state)

    chart_filename = None
    if result.get("needs_viz") and result.get("execution_result"):
        chart_filename = generate_chart(result["execution_result"], result["final_query"])

    if result.get("generated_sql") and not result.get("is_ambiguous"):
        save_history(
            query,
            result.get("final_query"),
            result.get("generated_sql"),
            result.get("explanation"),
            chart_filename
        )

    return {
        "transcription": result.get("transcription"),
        "final_query": result.get("final_query"),
        "sql": result.get("generated_sql"),
        "results": result.get("execution_result"),
        "explanation": result.get("explanation"),
        "needs_viz": result.get("needs_viz"),
        "chart_url": f"/static/images/{chart_filename}" if chart_filename else None,
        "is_ambiguous": result.get("is_ambiguous"),
        "clarifying_question": result.get("clarifying_question"),
        "error": result.get("error_message"),
    }

@app.post("/query-voice")
async def query_voice(audio: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        from agents.transcription import transcribe_audio
        transcription = transcribe_audio(tmp_path)

        initial_state = {
            "audio_path": tmp_path,
            "transcription": transcription,
            "is_ambiguous": None,
            "clarifying_question": None,
            "user_clarification": None,
            "final_query": transcription,
            "generated_sql": None,
            "is_valid": None,
            "execution_result": None,
            "error_message": None,
            "retry_count": 0,
            "explanation": None,
            "needs_viz": None,
        }

        result = graph.invoke(initial_state)

        chart_filename = None
        if result.get("needs_viz") and result.get("execution_result"):
            chart_filename = generate_chart(result["execution_result"], result["final_query"])

        if result.get("generated_sql") and not result.get("is_ambiguous"):
            save_history(
                transcription,
                result.get("final_query"),
                result.get("generated_sql"),
                result.get("explanation"),
                chart_filename
            )

        return {
            "transcription": result.get("transcription"),
            "sql": result.get("generated_sql"),
            "results": result.get("execution_result"),
            "explanation": result.get("explanation"),
            "needs_viz": result.get("needs_viz"),
            "chart_url": f"/static/images/{chart_filename}" if chart_filename else None,
            "is_ambiguous": result.get("is_ambiguous"),
            "clarifying_question": result.get("clarifying_question"),
            "error": result.get("error_message"),
        }
    finally:
        os.unlink(tmp_path)

@app.get("/history")
async def history(limit: int = 10):
    return get_history(limit)