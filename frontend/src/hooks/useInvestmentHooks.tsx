import { useState } from "react";

export function useInvestmentHooks() {
  const [investmentType, setInvestmentType] = useState<string>("");
  const [marketValue, setMarketValue] = useState<string>("");
  const [taxStatus, setTaxStatus] = useState<"non-retirement" | "pre-tax" | "after-tax">("non-retirement");
    // add hook for id later

  return {
    investmentHooks: {
      investmentType,
      setInvestmentType,
      marketValue,
      setMarketValue,
      taxStatus,
      setTaxStatus,
    },
  };
}
