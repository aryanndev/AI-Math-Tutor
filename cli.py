import argparse
from ai_explainer import get_explanation
from history import save_to_history

def main():
    parser = argparse.ArgumentParser(description="AI Math Tutor Chatbot CLI")
    parser.add_argument("problem", type=str, help="The math problem to solve (e.g., '2*x + 3 = 7')")
    args = parser.parse_args()

    problem = args.problem
    print(f"\n--- Solving: {problem} ---\n")
    print("Generating AI response...\n")

    explanation = get_explanation(problem)
    print("Response:\n" + "="*50)
    print(explanation)
    print("="*50)

    save_to_history(problem, "N/A", explanation)
    print("\nSaved to history.")

if __name__ == "__main__":
    main()
