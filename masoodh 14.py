import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load CSV file
file_path = input("Enter path to CSV file: ")
try:
    df = pd.read_csv(file_path)
    print("Columns:", list(df.columns))
    
    print("\nChoose plot type:")
    print("1. Histogram")
    print("2. Boxplot")
    print("3. Scatter plot")
    choice = input("Enter choice (1/2/3): ")

    if choice == "1":
        col = input("Column for histogram: ")
        df[col].hist(bins=20)
        plt.title(f"Histogram of {col}")
        plt.xlabel(col)
        plt.ylabel("Frequency")
        plt.grid(True)
        plt.show()

    elif choice == "2":
        col = input("Column for boxplot: ")
        df.boxplot(column=col)
        plt.title(f"Boxplot of {col}")
        plt.grid(True)
        plt.show()

    elif choice == "3":
        xcol = input("X-axis column: ")
        ycol = input("Y-axis column: ")
        plt.scatter(df[xcol], df[ycol])
        plt.title(f"Scatter plot: {xcol} vs {ycol}")
        plt.xlabel(xcol)
        plt.ylabel(ycol)
        plt.grid(True)
        plt.show()
        
    else:
        print("Invalid choice.")
except Exception as e:
    print("Error:", e)
