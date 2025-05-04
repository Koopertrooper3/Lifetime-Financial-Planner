import { useState } from "react";
import { assetProportion } from "../../../backend/db/EventSchema";
import { Investment } from "../../../backend/db/InvestmentSchema";

export function useEventSeriesFormHooks() {
  const [eventSeriesName, setEventSeriesName] = useState<string | number>("");
  const [eventSeriesDescription, setEventSeriesDescription] = useState<
    string | number
  >("");

  const [startYearModel, setStartYearModel] = useState("Fixed Value");
  const [startYear, setStartYear] = useState<string | number>("");
  const [meanYear, setMeanYear] = useState<string | number>("");
  const [stdDevYear, setStdDevYear] = useState<string | number>("");
  const [lowerBoundYear, setLowerBoundYear] = useState<string | number>("");
  const [upperBoundYear, setUpperBoundYear] = useState<string | number>("");

  const [durationType, setDurationType] = useState("Fixed Value");
  const [durationValue, setDurationValue] = useState<string | number>("");
  const [meanDuration, setMeanDuration] = useState<string | number>("");
  const [stdDuration, setStdDuration] = useState<string | number>("");
  const [lowerBoundDuration, setLowerBoundDuration] = useState<string | number>(
    ""
  );
  const [upperBoundDuration, setUpperBoundDuration] = useState<string | number>(
    ""
  );

  const [eventType, setEventType] = useState<
    "income" | "expense" | "invest" | "rebalance"
  >("income");

  const [incomeType, setIncomeType] = useState<"Social Security" | "Wages">(
    "Social Security"
  );
  const [incomeInitialValue, setIncomeInitialValue] = useState<string | number>(
    ""
  );
  const [incomeDistributionType, setIncomeDistributionType] = useState<
    "Fixed Value/Percentage" | "Normal Distribution" | "Uniform Distribution"
  >("Fixed Value/Percentage");
  const [isFixedIncomeAmount, setIsFixedIncomeAmount] = useState(true);
  const [fixedIncomeValue, setFixedIncomeValue] = useState<string | number>("");
  const [incomeMean, setIncomeMean] = useState<string | number>("");
  const [incomeStdDev, setIncomeStdDev] = useState<string | number>("");
  const [incomeLowerBound, setIncomeLowerBound] = useState<string | number>("");
  const [incomeUpperBound, setIncomeUpperBound] = useState<string | number>("");
  const [applyInflation, setApplyInflation] = useState(true);
  const [userPercentage, setUserPercentage] = useState(100);
  const [spousePercentage, setSpousePercentage] = useState(0);

  const [isDiscretionary, setIsDiscretionary] = useState(false);
  const [expenseInitialAmount, setExpenseInitialAmount] = useState<
    string | number
  >("");
  const [expenseDistributionType, setExpenseDistributionType] = useState<
    "Fixed Value/Percentage" | "Normal Distribution" | "Uniform Distribution"
  >("Fixed Value/Percentage");
  const [isExpenseAmount, setIsExpenseAmount] = useState(false);
  const [expenseFixedValue, setExpenseFixedValue] = useState<string | number>(
    ""
  );
  const [expenseMean, setExpenseMean] = useState<string | number>("");
  const [expenseStdDev, setExpenseStdDev] = useState<string | number>("");
  const [expenseLowerBound, setExpenseLowerBound] = useState<string | number>(
    ""
  );
  const [expenseUpperBound, setExpenseUpperBound] = useState<string | number>(
    ""
  );

  const [investAllocationType, setInvestAllocationType] = useState<
    "Fixed" | "Glide Path"
  >("Fixed");
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [allocatedInvestments, setAllocatedInvestments] = useState<
    Record<string, number>
  >({});
  const [allocated2Investments, setAllocated2Investments] = useState<
    Record<string, number>
  >({});
  const [investStartYear, setInvestStartYear] = useState("");
  const [investEndYear, setInvestEndYear] = useState("");
  const [investMaxCashHoldings, setInvestMaxCashHoldings] = useState("");

  const [allocationType, setAllocationType] = useState<"Fixed" | "Glide Path">(
    "Fixed"
  );
  const [rebalanceStartYear, setRebalanceStartYear] = useState("");
  const [rebalanceEndYear, setRebalanceEndYear] = useState("");
  const [rebalanceInvestments, setRebalanceInvestments] = useState<
    Investment[]
  >([]);
  const [allocatedRebalanceInvestments, setAllocatedRebalanceInvestments] =
    useState<Record<string, number>>({});
  const [allocatedRebalance2Investments, setAllocatedRebalance2Investments] =
    useState<Record<string, number>>({});
  const [taxStatus, setTaxStatus] = useState<
    "pre-tax" | "after-tax" | "non-retirement"
  >("pre-tax");
  const [rebalanceMaxCashHoldings, setRebalanceMaxCashHoldings] = useState("");

  const [withOrAfter, setWithOrAfter] = useState<"with" | "after">("with");
  const [selectedEvent, setSelectedEvent] = useState("");

  return {
    eventSeriesFormHooks: {
      eventSeriesName,
      setEventSeriesName,
      eventSeriesDescription,
      setEventSeriesDescription,
      startYearModel,
      setStartYearModel,
      startYear,
      setStartYear,
      meanYear,
      setMeanYear,
      stdDevYear,
      setStdDevYear,
      lowerBoundYear,
      setLowerBoundYear,
      upperBoundYear,
      setUpperBoundYear,
      durationType,
      setDurationType,
      durationValue,
      setDurationValue,
      meanDuration,
      setMeanDuration,
      stdDuration,
      setStdDuration,
      lowerBoundDuration,
      setLowerBoundDuration,
      upperBoundDuration,
      setUpperBoundDuration,
      eventType,
      setEventType,
      incomeType,
      setIncomeType,
      incomeInitialValue,
      setIncomeInitialValue,
      incomeDistributionType,
      setIncomeDistributionType,
      isFixedIncomeAmount,
      setIsFixedIncomeAmount,
      fixedIncomeValue,
      setFixedIncomeValue,
      incomeMean,
      setIncomeMean,
      incomeStdDev,
      setIncomeStdDev,
      incomeLowerBound,
      setIncomeLowerBound,
      incomeUpperBound,
      setIncomeUpperBound,
      applyInflation,
      setApplyInflation,
      userPercentage,
      setUserPercentage,
      spousePercentage,
      setSpousePercentage,
      isDiscretionary,
      setIsDiscretionary,
      expenseInitialAmount,
      setExpenseInitialAmount,
      expenseDistributionType,
      setExpenseDistributionType,
      isExpenseAmount,
      setIsExpenseAmount,
      expenseFixedValue,
      setExpenseFixedValue,
      expenseMean,
      setExpenseMean,
      expenseStdDev,
      setExpenseStdDev,
      expenseLowerBound,
      setExpenseLowerBound,
      expenseUpperBound,
      setExpenseUpperBound,
      investAllocationType,
      setInvestAllocationType,
      investments,
      setInvestments,
      allocatedInvestments,
      setAllocatedInvestments,
      allocated2Investments,
      setAllocated2Investments,
      investStartYear,
      setInvestStartYear,
      investEndYear,
      setInvestEndYear,
      investMaxCashHoldings,
      setInvestMaxCashHoldings,
      allocationType,
      setAllocationType,
      rebalanceStartYear,
      setRebalanceStartYear,
      rebalanceEndYear,
      setRebalanceEndYear,
      rebalanceInvestments,
      setRebalanceInvestments,
      allocatedRebalanceInvestments,
      setAllocatedRebalanceInvestments,
      allocatedRebalance2Investments,
      setAllocatedRebalance2Investments,
      taxStatus,
      setTaxStatus,
      rebalanceMaxCashHoldings,
      setRebalanceMaxCashHoldings,
      withOrAfter,
      setWithOrAfter,
      selectedEvent,
      setSelectedEvent,
    },
  };
}
