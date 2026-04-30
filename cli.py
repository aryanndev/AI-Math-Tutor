import argparse
from solver import solve_math_problem
from ai_explainer import get_explanation
from history import save_to_history

def main():
    parser = argparse.ArgumentParser(description="AI Math Problem Solver")
    parser.add_argument("problem", type=str, help="The math problem to solve (e.g., '2*x + 3 = 7')")
    args = parser.parse_args()

    problem = args.problem
    print(f"\n--- Solving: {problem} ---\n")

    solution = solve_math_problem(problem)
    if "Error" in solution:
        print(solution)
        return

    print(f"SymPy Verified Solution: {solution}\n")
    print("Generating step-by-step AI explanation...\n")

    explanation = get_explanation(problem, solution)
    print("Explanation:\n" + "="*50)
    print(explanation)
    print("="*50)

    save_to_history(problem, solution, explanation)
    print("\nSaved to history.")

if __name__ == "__main__":
    main()
