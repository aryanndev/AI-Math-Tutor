import json
import os
from datetime import datetime

HISTORY_FILE = "history.json"

def save_to_history(problem, solution, explanation):
    history = load_history()
    entry = {
        "timestamp": datetime.now().isoformat(),
        "problem": problem,
        "solution": solution,
        "explanation": explanation
    }
    history.append(entry)
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)

def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    with open(HISTORY_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []
