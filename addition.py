#!/usr/bin/env python3
"""
Simple Addition Program
Performs basic addition operations
"""

def add(a, b):
    """
    Add two numbers and return the result
    
    Args:
        a: First number
        b: Second number
    
    Returns:
        The sum of a and b
    """
    return a + b


def main():
    """Main function to run the addition program"""
    print("Welcome to the Addition Program!")
    print("-" * 40)
    
    try:
        # Get user input
        num1 = float(input("Enter the first number: "))
        num2 = float(input("Enter the second number: "))
        
        # Calculate sum
        result = add(num1, num2)
        
        # Display result
        print("-" * 40)
        print(f"{num1} + {num2} = {result}")
        print("-" * 40)
        
    except ValueError:
        print("Error: Please enter valid numbers!")


if __name__ == "__main__":
    main()
