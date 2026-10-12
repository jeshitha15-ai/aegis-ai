# Aegis AI — Autonomous Investigation & Resolution Agent

A learning starter with a React dashboard, FastAPI backend, LLM tool calling, synthetic diagnostic tools, SQLite persistence, and a basic runbook search. All diagnostics use synthetic data; no real systems are changed.

## Requirements
- Python 3.11+
- Node.js 20+
- A model API key for an OpenAI-compatible Chat Completions tool-calling API

## Backend (Windows PowerShell)
```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```
Edit `backend/.env` and set your key. Never commit `.env`.

Start the backend from the `backend` folder:
```powershell
uvicorn app.main:app --reload
```
Open http://127.0.0.1:8000/docs.

## Frontend (new terminal)
```powershell
cd frontend
npm install
npm run dev
```
Open the URL Vite prints, usually http://localhost:5173.

## Implemented
- FastAPI endpoints for investigation and saved history
- Four allowlisted, read-only diagnostic tools using synthetic data
- Real model tool-calling loop with a maximum of six rounds
- SQLite persistence
- React incident submission and evidence/trace dashboard
- Baseline keyword retrieval for runbooks (not embeddings yet)

## Safety and cost
The app recommends actions but does not execute fixes. Use synthetic or sanitized data; never send secrets. Model API usage may incur charges. If using another provider, adapt `app/agent.py` to its tool-calling API.
