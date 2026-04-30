# ✨ AI Math Problem Solver

An intelligent, hybrid math-solving application that combines the exact, rigorous symbolic computation of **SymPy** with the advanced reasoning and explanation capabilities of **Google Gemini AI**.

The application provides you with a verified, exact answer and follows it up with a detailed, step-by-step tutorial on how to arrive at that answer, acting as your personal AI math tutor. It features a sleek, premium glassmorphism UI with dynamic animations.

## 🌟 Features

- **Guaranteed Correctness**: Uses the SymPy math engine to compute exact solutions, ensuring the AI never hallucinates the final answer.
- **AI-Powered Explanations**: Uses the free-tier Google Gemini API (`gemini-flash-latest`) to generate highly detailed, step-by-step LaTeX-formatted explanations.
- **Premium User Interface**: A modern, animated frontend featuring advanced glassmorphism, floating background orbs, glowing inputs, and smooth staggered reveal animations.
- **Dual Interface**: Use the application via the beautiful web interface or directly from your terminal via the CLI.
- **History Tracking**: Automatically saves your past problems, solutions, and explanations to a local JSON history file.

## 🛠️ Installation

1. **Navigate to the project directory**:
   ```bash
   cd Ai-Math-Tutor
   ```

2. **Install the dependencies**:
   Ensure you have Python 3 installed, then run:
   ```bash
   pip install -r requirements.txt
   ```

## 🚀 Usage

### Web Interface

Start the backend FastAPI server:
```bash
python3 app.py
```
Then, open your web browser and navigate to `http://localhost:8000`.

### Command Line Interface (CLI)

You can also solve math problems directly from your terminal using the built-in CLI:
```bash
python3 cli.py "2*x + 3 = 7"
```
Or to simplify an expression:
```bash
python3 cli.py "x**2 - 4"
```

## 🧠 How it Works

1. **Input**: You provide a mathematical expression or equation.
2. **Solver Layer**: `solver.py` uses SymPy to securely parse and calculate the exact mathematical result.
3. **Explanation Layer**: `ai_explainer.py` sends the original problem and the verified SymPy solution to the Gemini API via a secure HTTP POST request. Gemini uses this to reverse-engineer and explain the steps to reach that exact answer.
4. **Display**: The frontend renders the LaTeX math beautifully using MathJax and reveals the answer with fluid animations.

*Note: This "vibe code" project was developed as a proof-of-concept showcase for a university assignment.*
