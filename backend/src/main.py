import json
from fastapi import FastAPI, HTTPException, Form, UploadFile, File
from langchain_core.messages import HumanMessage
from agents import arbitrator_graph
from tools import extract_code_from_zip
from fastapi.middleware.cors import CORSMiddleware

# python -m uvicorn main:app --reload --port 8000

app = FastAPI(title="Freelance-Escrow AI Arbitrator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/dispute/resolve")
async def resolve_dispute(
    milestone_requirements: str = Form(...),
    client_dispute_reason: str = Form(...),
    github_url: str = Form(None),
    live_site_url: str = Form(None),
    project_zip: UploadFile = File(None) 
):
    try:
        instruction = f"""
        Please verify the following milestone.
        Requirements: {milestone_requirements}
        The client disputed this with the reason: {client_dispute_reason}
        """
        
        # PARAMETER CHECK BASIN BLANK
        if github_url and github_url.strip() and github_url.lower() != "string":
            instruction += f"\nCode Repository: {github_url}"
        if live_site_url and live_site_url.strip() and live_site_url.lower() != "string":
            instruction += f"\nLive Deployment: {live_site_url}"
            

        # 3. TANAWN IF NAY GIPASA NA ZIP SA PARAMETERS IF NAA IUNZIP UG IEXTRACT ANG CODE FILES RA WAY LABOT TUNG MGA WAY GAMIT E.G. NODE_MODULES
        #  IF FILE RA KAY KWAON RA DIRECTLY ANG CONTENT
        if project_zip:
            file_bytes = await project_zip.read()
            
            if project_zip.filename.endswith('.zip'):
                # FOR ZIP
                file_content = extract_code_from_zip(file_bytes)
                instruction += f"\n\nDirectly Uploaded ZIP Content:\n{file_content}"
            else:
                # FOR RAW SINGLE FILE
                try:
                    raw_text = file_bytes.decode('utf-8')
                    # Truncate to 2000 chars to save tokens
                    instruction += f"\n\nDirectly Uploaded File ({project_zip.filename}):\n{raw_text[:2000]}"
                except UnicodeDecodeError:
                    pass # Ignore if they uploaded an image or weird binary file


        inputs = {
            "messages": [HumanMessage(content=instruction)]
        }
        
        config = {"recursion_limit": 10} 
        final_state = arbitrator_graph.invoke(inputs, config=config)
        
        judgment_str = final_state.get("final_judgment", "{}")
        judgment_json = json.loads(judgment_str)
        
        return judgment_json

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid JSON format.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)