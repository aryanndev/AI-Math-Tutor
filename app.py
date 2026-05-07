from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os

from ai_explainer import get_chat_response
from history import save_to_history, load_history
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Math Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("frontend", exist_ok=True)
app.mount("/static", StaticFiles(directory="frontend"), name="static")


class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    text: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


@app.post("/chat")
async def chat(req: ChatRequest):
    messages = [{"role": m.role, "text": m.text} for m in req.messages]

    last_user_text = messages[-1]["text"]

    ai_response = get_chat_response(messages)

    # Save to history
    save_to_history(
        problem=last_user_text,
        solution="N/A",
        explanation=ai_response
    )

    return {
        "response": ai_response
    }


@app.get("/api/history")
async def history():
    return load_history()


@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("frontend/index.html", "r", encoding="utf-8") as f:
        return f.read()


if __name__ == "__main__":
    print("Starting MathBot server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
