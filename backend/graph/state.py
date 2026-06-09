from typing import TypedDict, Optional

class AgentState(TypedDict):
    audio_path: Optional[str]
    transcription: Optional[str]
    is_ambiguous: Optional[bool]
    clarifying_question: Optional[str]
    user_clarification: Optional[str]
    final_query: Optional[str]
    generated_sql: Optional[str]
    is_valid: Optional[bool]
    execution_result: Optional[list]
    error_message: Optional[str]
    retry_count: int
    explanation: Optional[str]
    needs_viz: Optional[bool]