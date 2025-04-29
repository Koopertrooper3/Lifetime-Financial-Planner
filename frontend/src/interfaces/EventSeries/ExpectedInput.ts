export interface ExpectedInput {
  distributionType:
  | "Fixed Value/Percentage"
  | "Normal Distribution"
  | "Uniform Distribution";
  setDistributionType: (value: "Fixed Value/Percentage"
  | "Normal Distribution"
  | "Uniform Distribution") => void;
  isFixedAmount: boolean;
  setIsFixedAmount: (value: boolean) => void;
  fixedValue?: string | number;
  setFixedValue?: (value: string | number) => void;
  mean?: string | number;
  setMean?: (value: string | number) => void;
  stdDev?: string | number;
  setStdDev?: (value: string | number) => void;
  lowerBound?: string | number;
  setLowerBound?: (value: string | number) => void;
  upperBound?: string | number;
  setUpperBound?: (value: string | number) => void;
}