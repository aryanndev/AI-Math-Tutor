import requests
import os

def get_explanation(problem, solution):
    # Using the API key provided in the request
    api_key = "Your API KEY HERE"
    
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": api_key
    }
    
    prompt = f"""
You are a friendly and patient math tutor.

Problem: {problem}
Final Answer (already verified): {solution}

Instructions:

* Start with a short greeting (1–2 lines).
* Explain the solution step by step in a detailed and easy-to-understand way.
* Use numbered steps.
* Each step should include what is being done and why it is done.
* Use simple language as if teaching a beginner.
* Do not repeat the full problem.
* Use basic math notation (like x^2, /, *, etc.), not LaTeX.
* Make sure all steps logically lead to the given final answer.
* Use plain text only (no markdown, no bold, no special formatting).
* Avoid unnecessary filler, but ensure the explanation is clear and complete.

Format:
Greeting line

1. step with explanation (what + why)
2. step with explanation (what + why)
   ...

Final Answer: {solution}
"""

    data = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        return f"Error generating explanation: {e}"
