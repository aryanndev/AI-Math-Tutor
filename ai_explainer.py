import requests
import os
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """You are MathBot, a friendly and expert math tutor AI assistant. 
You specialize ONLY in mathematics — algebra, calculus, geometry, statistics, number theory, linear algebra, and all other math topics.
If a user asks about something unrelated to math, politely redirect them back to math topics.

You operate in two modes:
1. Solving Mode: For computational queries (e.g., "solve x^2+2x", "integrate sin(x)").
   - Show clear, numbered step-by-step solutions
   - Use LaTeX formatting for equations
   - Explain each step carefully

2. Explanation Mode: For conceptual or theory questions (e.g., "tell me about pythagorean theorem", "what is a derivative?").
   - Give intuitive and educational explanations
   - Use examples and analogies when helpful
   - Avoid unnecessary symbolic computation
   - Only use equations when relevant

Keep your tone friendly, clear, and educational."""

def get_chat_response(messages: list) -> str:
    """
    messages: list of {"role": "user"/"assistant", "text": "..."}
    """
    api_key = os.getenv("GEMINI_API_KEY")
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": api_key
    }

    # Build the Gemini contents array with conversation history
    contents = []

    # Inject system prompt as the first user turn (Gemini doesn't have a system role)
    contents.append({
        "role": "user",
        "parts": [{"text": SYSTEM_PROMPT}]
    })
    contents.append({
        "role": "model",
        "parts": [{"text": "Understood! I'm MathBot, your friendly math tutor. Ask me anything math-related and I'll help you solve it step by step. 🧮"}]
    })

    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg["text"]}]
        })

    data = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 2048,
        }
    }

    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        return f"Sorry, I encountered an error: {e}"


# Legacy single-turn function kept for backwards compatibility
def get_explanation(problem):
    messages = [{"role": "user", "text": f"Solve and explain: {problem}"}]
    return get_chat_response(messages)
