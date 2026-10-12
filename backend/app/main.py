from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import InvestigationRequest
from .agent import run_investigation
from .storage import init_db, save, list_all, get_one

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
app = FastAPI(title="Aegis AI API", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
@app.get("/api/health")
def health(): return {"status":"ok","service":"aegis-ai-api"}
@app.post("/api/investigate")
def investigate(req: InvestigationRequest):
    try:
        result = run_investigation(req.description,req.logs)
        result["id"] = save(req.description,result)
        return result
    except RuntimeError as e: raise HTTPException(status_code=503,detail=str(e))
    except Exception as e: raise HTTPException(status_code=500,detail="Investigation failed. Check backend terminal logs.") from e
@app.get("/api/investigations")
def history(): return list_all()
@app.get("/api/investigations/{investigation_id}")
def detail(investigation_id:int):
    result = get_one(investigation_id)
    if not result: raise HTTPException(status_code=404,detail="Investigation not found")
    return result
