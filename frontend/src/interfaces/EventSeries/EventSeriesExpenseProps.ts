type DistributionType =
  | "Fixed Value/Percentage"
  | "Normal Distribution"
  | "Uniform Distribution";

export interface EventSeriesExpenseProps {
  // Discretionary Expense
  isDiscretionary: boolean;
  setIsDiscretionary: (value: boolean) => void;

  // Initial Amount
  expenseInitialAmount: string | number;
  setExpenseInitialAmount: (value: string | number) => void;

  // Distribution Configuration
  expenseDistributionType: DistributionType;
  setExpenseDistributionType: (value: DistributionType) => void;
  isExpenseAmount: boolean;
  setIsExpenseAmount: (value: boolean) => void;

  // Fixed Value/Percentage
  expenseFixedValue?: string | number;
  setExpenseFixedValue?: (value: string | number) => void;

  // Normal Distribution
  expenseMean?: string | number;
  setExpenseMean?: (value: string | number) => void;
  expenseStdDev?: string | number;
  setExpenseStdDev?: (value: string | number) => void;

  // Uniform Distribution
  expenseLowerBound?: string | number;
  setExpenseLowerBound?: (value: string | number) => void;
  expenseUpperBound?: string | number;
  setExpenseUpperBound?: (value: string | number) => void;

  // Inflation Adjustment
  applyInflation: boolean;
  setInflation: (value: boolean) => void;

  // Expense Allocation
  userPercentage: number;
  setUserPercentage: (value: number) => void;
  spousePercentage: number;
  setSpousePercentage: (value: number) => void;
}