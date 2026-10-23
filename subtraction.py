def subtract(a, b):
    """
    Subtract two numbers and return the result.
    
    Args:
        a: The first number (minuend)
        b: The second number (subtrahend)
    
    Returns:
        The difference (a - b)
    """
    return a - b


if __name__ == "__main__":
    # Example usage
    num1 = 10
    num2 = 3
    result = subtract(num1, num2)
    print(f"{num1} - {num2} = {result}")
