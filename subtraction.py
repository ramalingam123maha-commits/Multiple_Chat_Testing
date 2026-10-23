#!/usr/bin/env python3
"""
Simple subtraction program that takes two numbers and returns their difference.
"""

def subtract(a, b):
    """
    Subtract b from a and return the result.
    
    Args:
        a: The minuend (number to subtract from)
        b: The subtrahend (number to subtract)
    
    Returns:
        The difference (a - b)
    """
    return a - b


def main():
    """Main entry point for the subtraction program."""
    print("=== Subtraction Program ===")
    
    try:
        # Get input from user
        num1 = float(input("Enter the first number: "))
        num2 = float(input("Enter the second number: "))
        
        # Perform subtraction
        result = subtract(num1, num2)
        
        # Display result
        print(f"\n{num1} - {num2} = {result}")
        
    except ValueError:
        print("Error: Please enter valid numbers.")


if __name__ == "__main__":
    main()
