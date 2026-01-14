"""
LangGraph Agent for querying the Coveo UI-Kit Knowledge Graph.

Supports multiple LLM backends:
- Anthropic (Claude) via API key
- Ollama for local models
"""

import os
from typing import Annotated, TypedDict
from dotenv import load_dotenv

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

from tools import ALL_TOOLS

load_dotenv()


# =============================================================================
# STATE DEFINITION
# =============================================================================


class AgentState(TypedDict):
    """State passed between nodes in the graph."""

    messages: Annotated[list, add_messages]


# =============================================================================
# LLM CONFIGURATION
# =============================================================================


def get_llm():
    """Get the LLM based on environment configuration.
    
    Supports:
    - LLM_PROVIDER=anthropic  (Anthropic Claude - requires ANTHROPIC_API_KEY)
    - LLM_PROVIDER=ollama     (Local Ollama - requires OLLAMA_MODEL)
    """
    provider = os.getenv("LLM_PROVIDER", "anthropic").lower()

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic

        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("Missing ANTHROPIC_API_KEY in .env")

        return ChatAnthropic(
            model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest"),
            temperature=0,
            api_key=api_key,
        )

    elif provider == "ollama":
        from langchain_ollama import ChatOllama

        return ChatOllama(
            model=os.getenv("OLLAMA_MODEL", "llama3.1"),
            temperature=0,
        )

    else:
        raise ValueError(
            f"Unknown LLM_PROVIDER: {provider}. Use: anthropic or ollama"
        )


# =============================================================================
# GRAPH NODES
# =============================================================================


def create_agent():
    """Create the LangGraph agent with Neo4j tools."""

    llm = get_llm()
    llm_with_tools = llm.bind_tools(ALL_TOOLS)

    # Agent node - decides what to do next
    def agent_node(state: AgentState) -> AgentState:
        """The agent reasons about the query and decides which tools to call."""
        system_message = {
            "role": "system",
            "content": """You are an expert on the Coveo UI-Kit codebase. You have access to a knowledge graph 
that contains information about:

- **Packages**: The npm packages in the monorepo (@coveo/atomic, @coveo/headless, etc.)
- **Components**: Atomic web components (atomic-search-box, atomic-result-list, etc.)
- **Controllers**: Headless controllers (SearchBox, ResultList, Facet, etc.)
- **Actions**: Redux actions dispatched by controllers (search/executeSearch, etc.)
- **Reducers**: State slices that handle actions

Use the available tools to query the graph and answer questions about:
- How components work and what controllers they use
- What actions are dispatched when a user interacts with a component
- Package dependencies and structure
- The data flow from UI to state management

Always start by getting relevant information from the graph before answering.
Be precise and reference specific files/components when possible.""",
        }

        messages = [system_message] + state["messages"]
        response = llm_with_tools.invoke(messages)

        return {"messages": [response]}

    # Build the graph
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("agent", agent_node)
    graph.add_node("tools", ToolNode(ALL_TOOLS))

    # Add edges
    graph.add_edge(START, "agent")
    graph.add_conditional_edges("agent", tools_condition)
    graph.add_edge("tools", "agent")

    return graph.compile()


# =============================================================================
# CLI INTERFACE
# =============================================================================


def chat():
    """Interactive chat loop."""
    print("=" * 60)
    print("Coveo UI-Kit Knowledge Graph Agent")
    print("=" * 60)
    
    provider = os.getenv("LLM_PROVIDER", "anthropic")
    print(f"\nUsing LLM provider: {provider}")
    
    if provider == "anthropic":
        print("(Requires ANTHROPIC_API_KEY)")
    
    agent = create_agent()

    print("\nAsk questions about the codebase. Type 'quit' to exit.\n")
    print("Example questions:")
    print("  - What controllers does atomic-search-box use?")
    print("  - Trace the actions from atomic-result-list")
    print("  - What packages depend on @coveo/headless?")
    print("  - Show me the graph schema")
    print()

    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not user_input:
            continue

        if user_input.lower() in ("quit", "exit", "q"):
            print("Goodbye!")
            break

        try:
            # Run the agent
            result = agent.invoke({"messages": [{"role": "user", "content": user_input}]})

            # Print the final response
            final_message = result["messages"][-1]
            print(f"\nAssistant: {final_message.content}\n")
        except Exception as e:
            print(f"\nError: {e}\n")


def ask(question: str) -> str:
    """Single-shot query for programmatic use."""
    agent = create_agent()
    result = agent.invoke({"messages": [{"role": "user", "content": question}]})
    return result["messages"][-1].content


if __name__ == "__main__":
    chat()
