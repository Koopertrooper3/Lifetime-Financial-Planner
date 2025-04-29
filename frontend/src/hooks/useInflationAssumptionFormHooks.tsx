import { useState } from "react";

export function useInflationAssumptionHooks() {
  // Type definitions for inflation distribution options
  type InflationDistributionType = "Fixed Value/Percentage" | "Normal Distribution" | "Uniform Distribution";

  // Inflation assumption state
  const [inflationDistributionType, setInflationDistributionType] =
    useState<InflationDistributionType>("Fixed Value/Percentage");

  // Fixed value state
  const [fixedInflationValue, setFixedInflationValue] = useState<
    string | number
  >("2.5");

  // Normal distribution states
  const [mean, setMean] = useState<string | number>("");
  const [stdDev, setStdDev] = useState<string | number>("");

  // Uniform distribution states
  const [lowerBound, setLowerBound] = useState<string | number>("");
  const [upperBound, setUpperBound] = useState<string | number>("");

  const [annualContribution, setAnnualContribution] = useState<string | number>(
    ""
  );

  return {
    inflationAssumptionHooks: {
      // Distribution type
      inflationDistributionType,
      setInflationDistributionType,

      // Fixed value controls
      fixedInflationValue,
      setFixedInflationValue,

      // Normal distribution controls
      mean,
      setMean,
      stdDev,
      setStdDev,

      // Uniform distribution controls
      lowerBound,
      setLowerBound,
      upperBound,
      setUpperBound,

      // Additional settings
      annualContribution,
      setAnnualContribution,
    },
  };
}
