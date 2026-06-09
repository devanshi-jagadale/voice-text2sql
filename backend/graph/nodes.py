from agents.transcription import transcribe_audio
from agents.ambiguity import check_ambiguity
from agents.sql_generator import generate_sql
from agents.executor import execute_sql
from agents.healer import heal_sql
from agents.explainer import explain_result
from agents.viz_decider import decide_viz
from db.metadata import get_schema_context
from graph.state import AgentState
from agents.insight_agent import generate_insights

def transcription_node(state: AgentState) -> AgentState:
    text = transcribe_audio(state["audio_path"])
    return {**state, "transcription": text, "final_query": text}

def ambiguity_node(state: AgentState) -> AgentState:
    query = state.get("user_clarification") or state["transcription"]
    result = check_ambiguity(query)
    return {
        **state,
        "final_query": query,
        "is_ambiguous": result["is_ambiguous"],
        "clarifying_question": result.get("clarifying_question")
    }

def clarification_node(state: AgentState) -> AgentState:
    # Just passes through — frontend sends clarification back via /clarify
    return state

def sql_generator_node(state: AgentState) -> AgentState:
    schema = get_schema_context()
    sql = generate_sql(state["final_query"], schema)
    return {**state, "generated_sql": sql}

def executor_node(state: AgentState) -> AgentState:
    rows, error = execute_sql(state["generated_sql"])
    if error:
        return {
            **state,
            "execution_result": None,
            "error_message": error,
            "retry_count": state.get("retry_count", 0)
        }
    return {**state, "execution_result": rows, "error_message": None}

def healer_node(state: AgentState) -> AgentState:
    schema = get_schema_context()
    fixed_sql = heal_sql(
        state["generated_sql"],
        state["error_message"],
        state["final_query"],
        schema
    )
    return {
        **state,
        "generated_sql": fixed_sql,
        "retry_count": state.get("retry_count", 0) + 1
    }

def explainer_node(state: AgentState) -> AgentState:
    explanation = explain_result(state["final_query"], state["execution_result"])
    return {**state, "explanation": explanation}


def insight_node(state: AgentState) -> AgentState:
    insights = generate_insights(state["final_query"], state["execution_result"])
    return {**state, "insights": insights}

def viz_decider_node(state: AgentState) -> AgentState:
    needs_viz = decide_viz(state["execution_result"])
    return {**state, "needs_viz": needs_viz}