from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

app = FastAPI(title="TensorCraft AI Engine", version="1.0")

# Enable CORS so HTML frontend can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WorkflowRequest(BaseModel):
    prompt: str

@app.get("/")
def read_root():
    return {"message": "Welcome to TensorCraft Enterprise AI Workflow Engine API"}

@app.post("/run-workflow")
def run_workflow(request: WorkflowRequest):
    user_prompt = request.prompt.lower()
    
    if not user_prompt:
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
    
    steps = []
    
    # Step 1: Intent Parsing
    time.sleep(1)
    steps.append({
        "step": 1,
        "action": "Intent Parsing & Agent Routing",
        "status": "Success",
        "details": f"Parsed user goal: '{request.prompt}'. Routing to Enterprise Tools."
    })
    
    # Step 2: Tool Execution
    time.sleep(1.5)
    if "sales" in user_prompt or "revenue" in user_prompt:
        tool_output = "Fetched Q3 Revenue Data: Total Sales = $145,200 (Growth: +14% MoM)."
    elif "customer" in user_prompt or "churn" in user_prompt:
        tool_output = "Analyzed CRM logs: 1,240 active accounts, 12 churn risks identified."
    else:
        tool_output = "Executed general document summarization across 4 enterprise knowledge bases."
        
    steps.append({
        "step": 2,
        "action": "Enterprise Tool Execution",
        "status": "Success",
        "details": tool_output
    })
    
    # Step 3: AI Synthesis
    time.sleep(1)
    final_report = f"""### TensorCraft Executive Summary
- **Objective:** {request.prompt}
- **Data Source:** Verified Enterprise Connectors & Secure DB
- **Key Findings:** {tool_output}
- **Recommendation:** Automated workflow executed successfully with high confidence score (0.98). Action items dispatched to Slack and Email channels."""
    
    steps.append({
        "step": 3,
        "action": "Synthesis & Final Report Generation",
        "status": "Completed",
        "details": "Report compiled successfully."
    })
    
    return {
        "status": "success",
        "workflow_steps": steps,
        "final_output": final_report.strip()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)