from graph.state import AgentState

def route_ambiguity(state: AgentState):
    return "ambiguous" if state["is_ambiguous"] else "clear"

def route_execution(state: AgentState):
    if state["execution_result"] is not None:
        return "success"
    elif state["retry_count"] < 3:
        return "retry"
    else:
        return "give_up"