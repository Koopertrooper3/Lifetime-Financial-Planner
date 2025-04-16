export interface EventSeriesIncomeProps {
  incomeType: "Social Security" | "Wages";
  setIncomeType: (type: "Social Security" | "Wages") => void;

  initialAmount: string | number;
  setInitialAmount: (value: string | number) => void;

  distributionType:
    | "Fixed Value/Percentage"
    | "Normal Distribution"
    | "Uniform Distribution";
  setDistributionType: (
    type:
      | "Fixed Value/Percentage"
      | "Normal Distribution"
      | "Uniform Distribution"
  ) => void;

  isFixedAmount: boolean;
  setIsFixedAmount: (isFixedAmount: boolean) => void;

  fixedValue: string | number;
  setFixedValue: (value: string | number) => void;

  mean: string | number;
  setMean: (value: string | number) => void;

  stdDev: string | number;
  setStdDev: (value: string | number) => void;

  lowerBound: string | number;
  setLowerBound: (value: string | number) => void;

  upperBound: string | number;
  setUpperBound: (value: string | number) => void;

  applyInflation: boolean;
  setToggleInflation: (apply: boolean) => void;

  userPercentage: number;
  setUserPercentage: (value: number) => void;

  spousePercentage: number;
  setSpousePercentage: (value: number) => void;
}