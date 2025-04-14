/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from "react";
import { isDebug,User } from "./debug";

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

interface HelperContextType {
  fetchScenario: (id: string) => Promise<any>;
  fetchAllScenarios: () => Promise<any>;
  setGlobalUserID : (userId: string) => void
  userID: any,
  allInvestmentTypes: any[] | null;
  allScenarios: any[] | null;
  editScenario: any;
  setEditScenario: (scenario: any) => void;
  fetchDistribution: (id: string) => Promise<any>;

  investmentTypeHooks: InvestmentTypeHooks;
}

const HelperContext = createContext<HelperContextType>({
  fetchScenario: async () => null,
  fetchAllScenarios: async () => null,
  setGlobalUserID: async() => null,
  userID: "",
  allInvestmentTypes: null,
  allScenarios: null,
  editScenario: null,
  setEditScenario: () => {},
  fetchDistribution: async () => null,

  investmentTypeHooks: {
    investmentTypeName: "",
    setInvestmentTypeName: () => {},
    investmentTypeDescription: "",
    setInvestmentTypeDescription: () => {},
    expectedRatio: "",
    setExpectedRatio: () => {},

    returnDistributionType: "Fixed Amount/Percentage",
    setReturnDistributionType: () => {},
    incomeDistributionType: "Fixed Amount/Percentage",
    setIncomeDistributionType: () => {},

    taxable: true,
    setIsTaxable: () => {},

    isFixedReturnAmount: true,
    setIsFixedReturnAmount: () => {},
    returnFixedValue: "",
    setReturnFixedValue: () => {},
    returnMean: "",
    setReturnMean: () => {},
    returnStdDev: "",
    setReturnStdDev: () => {},

    isFixedIncomeAmount: true,
    setIsFixedIncomeAmount: () => {},
    incomeFixedValue: "",
    setIncomeFixedValue: () => {},
    incomeMean: "",
    setIncomeMean: () => {},
    incomeStdDev: "",
    setIncomeStdDev: () => {},
  },
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
  const [editScenario, setEditScenario] = useState(null);
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
    fetchAllInvestmentTypes();
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

  const setGlobalUserID = (userID : any) =>{
    setUserID(userID)
  }
  // const fetchInvestmentType = async (id: string) => {
  //   try {
  //     const res = await fetch(`http://localhost:8000/investmentTypes/${id}`);
  //     const json = await res.json();
  //     return json.data;
  //   } catch (error) {
  //     console.error("Error fetching investment type:", error);
  //   }
  // };

  const fetchAllInvestmentTypes = async () => {
    try {
      const res = await fetch(`http://localhost:8000/investmentTypes/`);
      const json = await res.json();
      console.log("Raw JSON from /investmentTypes:", json);
      setAllInvestmentTypes(json.data);
    } catch (error) {
      console.error("Error fetching investment type:", error);
    }
  };

  const fetchDistribution = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/distributions/${id}`);
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.error("Error fetching distribution:", error);
    }
  };

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
              editScenario,
              setEditScenario,
              fetchDistribution,
              investmentTypeHooks: {
                investmentTypeName,
                setInvestmentTypeName,
                investmentTypeDescription,
                setInvestmentTypeDescription,
                expectedRatio,
                setExpectedRatio,

                returnDistributionType,
                setReturnDistributionType,
                incomeDistributionType,
                setIncomeDistributionType,

                taxable,
                setIsTaxable,

                isFixedReturnAmount,
                setIsFixedReturnAmount,
                returnFixedValue,
                setReturnFixedValue,
                returnMean,
                setReturnMean,
                returnStdDev,
                setReturnStdDev,

                isFixedIncomeAmount,
                setIsFixedIncomeAmount,
                incomeFixedValue,
                setIncomeFixedValue,
                incomeMean,
                setIncomeMean,
                incomeStdDev,
                setIncomeStdDev,
              },
            }
          : {
              fetchScenario,
              fetchAllScenarios,
              setGlobalUserID,
              userID,
              allInvestmentTypes,
              allScenarios,
              editScenario,
              setEditScenario,
              fetchDistribution,
              investmentTypeHooks: {
                investmentTypeName,
                setInvestmentTypeName,
                investmentTypeDescription,
                setInvestmentTypeDescription,
                expectedRatio,
                setExpectedRatio,

                returnDistributionType,
                setReturnDistributionType,
                incomeDistributionType,
                setIncomeDistributionType,

                taxable,
                setIsTaxable,

                isFixedReturnAmount,
                setIsFixedReturnAmount,
                returnFixedValue,
                setReturnFixedValue,
                returnMean,
                setReturnMean,
                returnStdDev,
                setReturnStdDev,

                isFixedIncomeAmount,
                setIsFixedIncomeAmount,
                incomeFixedValue,
                setIncomeFixedValue,
                incomeMean,
                setIncomeMean,
                incomeStdDev,
                setIncomeStdDev,
              },
            }
      }
    >
      {children}
    </HelperContext.Provider>
  );
};
