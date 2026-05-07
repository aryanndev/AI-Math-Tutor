# ✨ AI Math Tutor Chatbot

An intelligent, conversational math-solving application powered entirely by the advanced reasoning and explanation capabilities of **Google Gemini AI**.

This application acts as your personal AI math tutor. It features a conversational interface where you can ask math questions, request step-by-step solutions, and ask follow-up questions for deeper understanding. The frontend boasts a sleek, premium glassmorphism UI with dynamic animations.

## 🌟 Features

- **Conversational Interface**: Chat naturally with the AI to explore math concepts, solve problems, and ask follow-up questions.
- **AI-Powered Explanations**: Uses the Google Gemini API (`gemini-flash-latest`) to generate highly detailed, step-by-step LaTeX-formatted explanations.
- **Context-Aware**: The AI remembers the context of your conversation, allowing for deep dives into specific topics.
- **Premium User Interface**: A modern, animated frontend featuring advanced glassmorphism, floating background orbs, glowing inputs, and smooth staggered reveal animations.
- **History Tracking**: Automatically saves your conversation history to a local JSON file.
- **CLI Support**: Use the application via the beautiful web interface or directly from your terminal.

## 🛠️ Installation

1. **Navigate to the project directory**:
   ```bash
   cd AI-Math-Tutor
   ```

2. **Install the dependencies**:
   Ensure you have Python 3 installed, then run:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure API Key**:
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

## 🚀 Usage

### Web Interface

Start the backend FastAPI server:
```bash
python3 app.py
```
Then, open your web browser and navigate to `http://localhost:8000`.

### Command Line Interface (CLI)

You can also chat with the math tutor directly from your terminal using the built-in CLI:
```bash
python3 cli.py "How do I solve 2*x + 3 = 7?"
```

## 🧠 How it Works

1. **Input**: You provide a mathematical query or follow-up question in the chat interface.
2. **Context Management**: The application maintains a history of your current session to provide context-aware responses.
3. **AI Processing**: `ai_explainer.py` sends your conversation history to the Gemini API via a secure HTTP request. Gemini acts as an expert math tutor, formatting its detailed responses in Markdown and LaTeX.
4. **Display**: The frontend renders the Markdown and LaTeX math beautifully using MathJax, presenting the conversation in a sleek, scrollable chat interface.

*Note: This "vibe code" project was developed as a proof-of-concept showcase for a university assignment.*