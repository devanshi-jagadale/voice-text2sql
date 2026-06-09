from langgraph import graph
from langgraph.graph import StateGraph, END
from graph.state import AgentState
from graph.nodes import (
    ambiguity_node,
    sql_generator_node, executor_node, healer_node,
    explainer_node, viz_decider_node, insight_node
)
from graph.edges import route_ambiguity, route_execution

def build_graph():
    graph = StateGraph(AgentState)

    graph.add_node("check_ambiguity", ambiguity_node)
    graph.add_node("generate_sql", sql_generator_node)
    graph.add_node("execute_sql", executor_node)
    graph.add_node("heal_sql", healer_node)
    graph.add_node("explain_result", explainer_node)
    graph.add_node("generate_insights", insight_node)
    graph.add_node("decide_viz", viz_decider_node)

    graph.set_entry_point("check_ambiguity")

    graph.add_edge("generate_sql", "execute_sql")
    graph.add_edge("explain_result", "generate_insights")
    graph.add_edge("generate_insights", "decide_viz")
    graph.add_edge("decide_viz", END)
    graph.add_edge("heal_sql", "execute_sql")

    graph.add_conditional_edges(
        "check_ambiguity",
        route_ambiguity,
        {
            "ambiguous": END,   # no quotes — END is an imported constant
            "clear": "generate_sql"
        }
    )

    graph.add_conditional_edges(
        "execute_sql",
        route_execution,
        {
            "success": "explain_result",
            "retry": "heal_sql",
            "give_up": END
        }
    )

    return graph.compile()