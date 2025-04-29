export interface ExpectedInputProps {
  inputType?: "return" | "income";
  valueType?: "Fixed Amount/Percentage" | "Normal Distribution";
  isFixedAmount?: boolean;
  setToggle?: (value: boolean) => void;
  fixedValue?: string | number;
  setFixedValue?: (value: string | number) => void;
  mean?: string | number;
  setMean?: (value: string | number) => void;
  stdDev?: string | number ;
  setStdDev?: (value: string | number) => void;
}