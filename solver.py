import sympy
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application

def solve_math_problem(problem_text):
    problem_text = problem_text.strip()
    transformations = standard_transformations + (implicit_multiplication_application,)
    
    try:
        if '=' in problem_text:
            lhs_str, rhs_str = problem_text.split('=', 1)
            lhs = parse_expr(lhs_str, transformations=transformations)
            rhs = parse_expr(rhs_str, transformations=transformations)
            eq = sympy.Eq(lhs, rhs)
            symbols = list(eq.free_symbols)
            if not symbols:
                # E.g. "2 + 2 = 4" -> True
                is_true = sympy.simplify(lhs - rhs) == 0
                return "True" if is_true else "False"
            
            solution = sympy.solve(eq, symbols)
            
            if isinstance(solution, dict):
                return ", ".join(f"{k} = {v}" for k, v in solution.items())
            elif isinstance(solution, list):
                if len(solution) > 0 and isinstance(solution[0], dict):
                    return " or ".join(", ".join(f"{k}={v}" for k,v in sol.items()) for sol in solution)
                else:
                    return f"{symbols[0]} = " + " or ".join(str(s) for s in solution)
            else:
                return str(solution)
        else:
            expr = parse_expr(problem_text, transformations=transformations)
            simplified = sympy.simplify(expr)
            return str(simplified)
    except Exception as e:
        return f"Error computing solution: {e}"
