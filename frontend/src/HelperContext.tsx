/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from "react";
import { isDebug, User } from "./debug";
import { Investment } from "./useScenarioContext";

type ValueType = "Fixed Amount/Percentage" | "Normal Distribution";

interface InvestmentTypeHooks {
  investmentTypeName: string | number;
  setInvestmentTypeName: (value: string | number) => void;

  investmentTypeDescription: string | number;
  setInvestmentTypeDescription: (value: string | number) => void;

  expectedRatio: string | number;
  setExpectedRatio: (value: string | number) => void;

  taxable: boolean;
  setIsTaxable: (value: boolean) => void;

  returnDistributionType: ValueType;
  setReturnDistributionType: (value: ValueType) => void;

  incomeDistributionType: ValueType;
  setIncomeDistributionType: (value: ValueType) => void;

  isFixedReturnAmount: boolean;
  setIsFixedReturnAmount: (value: boolean) => void;
  returnFixedValue: string | number;
  setReturnFixedValue: (value: string | number) => void;
  returnMean: string | number;
  setReturnMean: (value: string | number) => void;
  returnStdDev: string | number;
  setReturnStdDev: (value: string | number) => void;

  isFixedIncomeAmount: boolean;
  setIsFixedIncomeAmount: (value: boolean) => void;
  incomeFixedValue: string | number;
  setIncomeFixedValue: (value: string | number) => void;
  incomeMean: string | number;
  setIncomeMean: (value: string | number) => void;
  incomeStdDev: string | number;
  setIncomeStdDev: (value: string | number) => void;
}

interface EventSeriesFormHooks {
  eventSeriesName: string | number;
  setEventSeriesName: (value: string | number) => void;
  eventSeriesDescription: string | number;
  setEventSeriesDescription: (value: string | number) => void;

  // Year
  startYearModel: string;
  setStartYearModel: (value: string) => void;
  startYear: string | number;
  setStartYear: (value: string | number) => void;
  meanYear: string | number;
  setMeanYear: (value: string | number) => void;
  stdDevYear: string | number;
  setStdDevYear: (value: string | number) => void;
  lowerBoundYear: string | number;
  setLowerBoundYear: (value: string | number) => void;
  upperBoundYear: string | number;
  setUpperBoundYear: (value: string | number) => void;

  // Duration
  durationType: string;
  setDurationType: (value: string) => void;
  duration: string | number;
  setDuration: (value: string | number) => void;
  meanDuration: string | number;
  setMeanDuration: (value: string | number) => void;
  stdDuration: string | number;
  setStdDuration: (value: string | number) => void;
  lowerBoundDuration: string | number;
  setLowerBoundDuration: (value: string | number) => void;
  upperBoundDuration: string | number;
  setUpperBoundDuration: (value: string | number) => void;

  eventType: string;
  setEventType: (value: string) => void;

  // Income
  incomeType: "Social Security" | "Wages";
  setIncomeType: (value: "Social Security" | "Wages") => void;
  incomeInitialValue: string | number;
  setIncomeInitialValue: (value: string | number) => void;
  incomeDistributionType:
    | "Fixed Value/Percentage"
    | "Normal Distribution"
    | "Uniform Distribution";
  setIncomeDistributionType: (
    value:
      | "Fixed Value/Percentage"
      | "Normal Distribution"
      | "Uniform Distribution"
  ) => void;
  isFixedIncomeAmount: boolean;
  setIsFixedIncomeAmount: (value: boolean) => void;
  fixedIncomeValue: string | number;
  setFixedIncomeValue: (value: string | number) => void;
  incomeMean: string | number;
  setIncomeMean: (value: string | number) => void;
  incomeStdDev: string | number;
  setIncomeStdDev: (value: string | number) => void;
  incomeLowerBound: string | number;
  setIncomeLowerBound: (value: string | number) => void;
  incomeUpperBound: string | number;
  setIncomeUpperBound: (value: string | number) => void;
  applyInflation: boolean;
  setApplyInflation: (value: boolean) => void;
  userPercentage: number;
  setUserPercentage: (value: number) => void;
  spousePercentage: number;
  setSpousePercentage: (value: number) => void;

  // Expense
  isDiscretionary: boolean;
  setIsDiscretionary: (value: boolean) => void;
  expenseInitialAmount: string | number;
  setExpenseInitialAmount: (value: string | number) => void;
  expenseDistributionType:
    | "Fixed Value/Percentage"
    | "Normal Distribution"
    | "Uniform Distribution";
  setExpenseDistributionType: (
    value:
      | "Fixed Value/Percentage"
      | "Normal Distribution"
      | "Uniform Distribution"
  ) => void;
  isExpenseAmount: boolean;
  setIsExpenseAmount: (value: boolean) => void;
  expenseFixedValue: string | number;
  setExpenseFixedValue: (value: string | number) => void;
  expenseMean: string | number;
  setExpenseMean: (value: string | number) => void;
  expenseStdDev: string | number;
  setExpenseStdDev: (value: string | number) => void;
  expenseLowerBound: string | number;
  setExpenseLowerBound: (value: string | number) => void;
  expenseUpperBound: string | number;
  setExpenseUpperBound: (value: string | number) => void;

  // Invest
  investAllocationType: "Fixed" | "Glide Path";
  setInvestAllocationType: (value: "Fixed" | "Glide Path") => void;
  investments: Investment[];
  setInvestments: (value: Investment[]) => void;
  investStartYear: string;
  setInvestStartYear: (value: string) => void;
  investEndYear: string;
  setInvestEndYear: (value: string) => void;
  investMaxCashHoldings: string;
  setInvestMaxCashHoldings: (value: string) => void;

  // Rebalance
  allocationType: "Fixed" | "Glide Path";
  setAllocationType: (value: "Fixed" | "Glide Path") => void;
  rebalanceStartYear: string;
  setRebalanceStartYear: (value: string) => void;
  rebalanceEndYear: string;
  setRebalanceEndYear: (value: string) => void;
  rebalanceMaxCashHoldings: string;
  setRebalanceMaxCashHoldings: (value: string) => void;
}

interface HelperContextType {
  fetchScenario: (id: string) => Promise<any>;
  fetchAllScenarios: () => Promise<any>;
  setGlobalUserID: (userId: string) => void;
  userID: any;
  allInvestmentTypes: any[] | null;
  allScenarios: any[] | null;
}

const HelperContext = createContext<HelperContextType>({
  fetchScenario: async () => null,
  fetchAllScenarios: async () => null,
  setGlobalUserID: async () => null,
  userID: "",
  allInvestmentTypes: null,
  allScenarios: null,
});

export const useHelperContext = () => useContext(HelperContext);

export const HelperContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  type Scenario = {
    _id: string;
    name: string;
    [key: string]: any; //for scaling
  };

  type InvestmentType = {
    _id: string;
    name: string;
    [key: string]: any; //for scaling
  };

  const [allScenarios, setAllScenarios] = useState<Scenario[] | null>(null);
  const [allInvestmentTypes, setAllInvestmentTypes] = useState<
    InvestmentType[] | null
  >(null);

  const [userID, setUserID] = useState<User | null>(null);

  const mockScenarios = [
    { _id: "1", name: "Mock Retirement Plan" },
    { _id: "2", name: "Guest Scenario" },
  ];

  const mockInvestmentTypes = [
    { _id: "a", name: "Stocks" },
    { _id: "b", name: "Bonds" },
  ];

  // useEffect(() => {
  //   if (isDebug) {
  //     console.log("DEBUG MODE: Injecting mock scenario and investment data.");
  //     setAllScenarios(mockScenarios);
  //     setAllInvestmentTypes(mockInvestmentTypes);
  //   } else {
  //     fetchAllScenarios();
  //   }
  // }, []);

  // ------ WITHOUT DEBUG ------

  useEffect(() => {
    fetchAllScenarios();
  }, []);

  useEffect(() => {
    console.log("All investment types:", allInvestmentTypes);
  }, [allInvestmentTypes]);

  const fetchScenario = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/scenario/${id}`);
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.error("Error fetching scenario:", error);
    }
  };

  const fetchAllScenarios = async () => {
    try {
      const res = await fetch(`http://localhost:8000/scenario/`);
      const json = await res.json();
      setAllScenarios(json.data);
    } catch (error) {
      console.error("Error fetching all the scenarios:", error);
    }
  };

  const setGlobalUserID = (userID: any) => {
    setUserID(userID);
  };
  // const fetchInvestmentType = async (id: string) => {
  //   try {
  //     const res = await fetch(`http://localhost:8000/investmentTypes/${id}`);
  //     const json = await res.json();
  //     return json.data;
  //   } catch (error) {
  //     console.error("Error fetching investment type:", error);
  //   }
  // };

  return (
    <HelperContext.Provider
      value={
        isDebug
          ? {
              fetchScenario: async (id: string) =>
                mockScenarios.find((s) => s._id === id),
              fetchAllScenarios: async () => mockScenarios,
              setGlobalUserID,
              userID,
              allInvestmentTypes: mockInvestmentTypes,
              allScenarios: mockScenarios,
            }
          : {
              fetchScenario,
              fetchAllScenarios,
              setGlobalUserID,
              userID,
              allInvestmentTypes,
              allScenarios,
            }
      }
    >
      {children}
    </HelperContext.Provider>
  );
};
