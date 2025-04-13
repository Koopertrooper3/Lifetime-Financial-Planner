export interface ExpectedInputProps {
  inputType: "return" | "income";
  valueType: "Fixed Amount/Percentage" | "Normal Distribution";
  isFixedAmount: boolean;
  onToggleFixedAmount: (value: boolean) => void;
  fixedValue: string;
  onFixedValueChange: (value: string) => void;
  mean?: string;
  onMeanChange?: (value: string) => void;
  stdDev?: string;
  onStdDevChange?: (value: string) => void;
}