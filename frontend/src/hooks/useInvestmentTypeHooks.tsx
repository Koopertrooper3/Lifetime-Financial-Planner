import { useState } from "react";

export function useInvestmentTypeHooks() {
  // Investment Type Form
  const [investmentTypeName, setInvestmentTypeName] = useState<string | number>(
    ""
  );
  const [investmentTypeDescription, setInvestmentTypeDescription] = useState<
    string | number
  >("");
  const [expectedRatio, setExpectedRatio] = useState<string | number>("");

  // Type definitions for distribution options
  type ValueType = "Fixed Amount/Percentage" | "Normal Distribution";

  // returnType and incomeType are used to differentiate between fixed amount/percentage and normal distribution
  const [returnDistributionType, setReturnDistributionType] =
    useState<ValueType>("Fixed Amount/Percentage");
  const [incomeDistributionType, setIncomeDistributionType] =
    useState<ValueType>("Fixed Amount/Percentage");

  const [taxable, setIsTaxable] = useState(true);

  // useStates for expected annual return
  // isFixedReturnAmount is used to differentiate between whether the value is in percentage or dollar
  const [isFixedReturnAmount, setIsFixedReturnAmount] = useState(true);
  const [returnFixedValue, setReturnFixedValue] = useState<string | number>("");
  const [returnMean, setReturnMean] = useState<string | number>("");
  const [returnStdDev, setReturnStdDev] = useState<string | number>("");

  // useStates for expected annual income
  const [isFixedIncomeAmount, setIsFixedIncomeAmount] = useState(true);
  const [incomeFixedValue, setIncomeFixedValue] = useState<string | number>("");
  const [incomeMean, setIncomeMean] = useState<string | number>("");
  const [incomeStdDev, setIncomeStdDev] = useState<string | number>("");

  return {
    investmentTypeHooks: {
      // Form Inputs
      investmentTypeName,
      setInvestmentTypeName,
      investmentTypeDescription,
      setInvestmentTypeDescription,
      expectedRatio,
      setExpectedRatio,

      // Distribution Types
      returnDistributionType,
      setReturnDistributionType,
      incomeDistributionType,
      setIncomeDistributionType,

      // Taxable
      taxable,
      setIsTaxable,

      // Return
      isFixedReturnAmount,
      setIsFixedReturnAmount,
      returnFixedValue,
      setReturnFixedValue,
      returnMean,
      setReturnMean,
      returnStdDev,
      setReturnStdDev,

      // Income
      isFixedIncomeAmount,
      setIsFixedIncomeAmount,
      incomeFixedValue,
      setIncomeFixedValue,
      incomeMean,
      setIncomeMean,
      incomeStdDev,
      setIncomeStdDev,
    },
  };
}
