from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os

from solver import solve_math_problem
from ai_explainer import get_explanation
from history import save_to_history, load_history

app = FastAPI(title="AI Math Problem Solver")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure frontend dir exists for static files
os.makedirs("frontend", exist_ok=True)
app.mount("/static", StaticFiles(directory="frontend"), name="static")

class ProblemRequest(BaseModel):
    problem: str

@app.post("/solve")
async def solve(req: ProblemRequest):
    problem = req.problem
    solution = solve_math_problem(problem)
    
    if "Error" in solution:
        return JSONResponse(status_code=400, content={"error": solution})
        
    explanation = get_explanation(problem, solution)
    
    save_to_history(problem, solution, explanation)
    
    return {
        "problem": problem,
        "solution": solution,
        "explanation": explanation
    }

@app.get("/api/history")
async def history():
    return load_history()

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("frontend/index.html", "r", encoding="utf-8") as f:
        return f.read()

if __name__ == "__main__":
    print("Starting server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
