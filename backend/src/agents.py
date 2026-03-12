import os
from typing import Annotated, TypedDict
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import create_react_agent
from tools import web_scraper_tool, fetch_github_code, check_link_status

load_dotenv()

class AgentState(TypedDict):
    messages: Annotated[list, "The conversation history"]
    next_agent: str
    final_judgment: str

llm = ChatOpenAI(model="gpt-4o-mini", api_key=os.getenv("OPENAI_API_KEY"), temperature=0)

# WORKER AGENTS 
code_agent = create_react_agent(
    llm, tools=[fetch_github_code], 
    prompt="You are a Smart Contract Auditor. Use tools to fetch EVM code from GitHub and analyze if it meets the milestone."
)

web_agent = create_react_agent(
    llm, tools=[web_scraper_tool], 
    prompt="You are a UI Auditor. Use the scraper tool to read live websites and verify required features exist."
)

link_agent = create_react_agent(
    llm, tools=[check_link_status], 
    prompt="You are a Link Validator. Verify all provided URLs are active."
)

# SUPERVISOR NODE 
def supervisor_node(state: AgentState):
    system_prompt = """
    You are the Escrow Supervisor. Review the conversation history.
    Decide the next step to verify the milestone:
    - Return exactly 'CodeAgent' ONLY if a specific GitHub URL is provided and needs to be fetched.
    - Return exactly 'WebAgent' ONLY if a live website URL is provided and needs to be scraped.
    - Return exactly 'FINISH' if the code is already provided in the history (e.g., from a ZIP file upload) or if you have enough info to judge.
    
    Do NOT call the CodeAgent if the code is already provided in the prompt.
    Respond ONLY with one of those words.
    """
    messages = [SystemMessage(content=system_prompt)] + state["messages"]
    response = llm.invoke(messages)
    decision = response.content.strip()
    
    if decision not in ["CodeAgent", "WebAgent", "LinkAgent", "FINISH"]:
        decision = "FINISH"
    return {"next_agent": decision}

# JUDGE NODE 
def judge_node(state: AgentState):
    system_prompt = """
    You are the Freelance-Escrow AI Arbitrator. Based on the research in the history, 
    make a final decision on the dispute.
    
    Output strictly in this JSON format:
    {
      "status": "RELEASE" or "DISPUTE",
      "reasoning": "2-3 sentence technical justification.",
      "missing_requirements": ["list", "of", "missing", "items"],
      "confidence_score": 0.9,
      "audit_level": "PASSED" or "WARNING" or "CRITICAL_FAILURE"
    }
    """
    messages = [SystemMessage(content=system_prompt)] + state["messages"]
    response = llm.invoke(messages)
    
    raw_json = response.content.replace("```json", "").replace("```", "").strip()
    return {"final_judgment": raw_json}

# GRAPH ROUTING WRAPPERS
def run_code_agent(state: AgentState):
    result = code_agent.invoke(state)
    return {"messages": [result["messages"][-1]]}

def run_web_agent(state: AgentState):
    result = web_agent.invoke(state)
    return {"messages": [result["messages"][-1]]}

def run_link_agent(state: AgentState):
    result = link_agent.invoke(state)
    return {"messages": [result["messages"][-1]]}

# BUILDINGS GRAPHSS 
workflow = StateGraph(AgentState)

workflow.add_node("Supervisor", supervisor_node)
workflow.add_node("CodeAgent", run_code_agent)
workflow.add_node("WebAgent", run_web_agent)
workflow.add_node("LinkAgent", run_link_agent)
workflow.add_node("Judge", judge_node)

workflow.add_edge(START, "Supervisor")

workflow.add_conditional_edges(
    "Supervisor", 
    lambda x: x["next_agent"], 
    {
        "CodeAgent": "CodeAgent",
        "WebAgent": "WebAgent",
        "LinkAgent": "LinkAgent",
        "FINISH": "Judge"
    }
)

workflow.add_edge("CodeAgent", "Supervisor")
workflow.add_edge("WebAgent", "Supervisor")
workflow.add_edge("LinkAgent", "Supervisor")
workflow.add_edge("Judge", END)

arbitrator_graph = workflow.compile()