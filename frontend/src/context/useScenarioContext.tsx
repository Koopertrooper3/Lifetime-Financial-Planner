import React, { createContext, useContext, useState } from "react";
import {
  FixedDistribution,
  NormalDistribution,
  UniformDistribution,
} from "../../../backend/db/DistributionSchemas.ts";
import { InvestmentType } from "../../../backend/db/InvestmentTypesSchema.ts";
import { Investment } from "../../../backend/db/InvestmentSchema.ts";
import { Event } from "../../../backend/db/EventSchema.ts";
import { Scenario } from "../../../backend/db/Scenario.ts";

// Context Type
interface ScenarioContextType {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  maritalStatus: "individual" | "couple";
  setMaritalStatus: React.Dispatch<
    React.SetStateAction<"individual" | "couple">
  >;
  birthYears: number[];
  setBirthYears: React.Dispatch<React.SetStateAction<number[]>>;
  lifeExpectancy: (
    | FixedDistribution
    | NormalDistribution
    | UniformDistribution
  )[];
  setLifeExpectancy: React.Dispatch<
    React.SetStateAction<
      (FixedDistribution | NormalDistribution | UniformDistribution)[]
    >
  >;
  investmentTypes: Record<string, InvestmentType>;
  setInvestmentTypes: React.Dispatch<
    React.SetStateAction<Record<string, InvestmentType>>
  >;
  investments: Record<string, Investment>;
  setInvestments: React.Dispatch<
    React.SetStateAction<Record<string, Investment>>
  >;
  eventSeries: Record<string, Event>;
  setEventSeries: React.Dispatch<React.SetStateAction<Record<string, Event>>>;
  inflationAssumption:
    | FixedDistribution
    | NormalDistribution
    | UniformDistribution;
  setInflationAssumption: React.Dispatch<
    React.SetStateAction<
      FixedDistribution | NormalDistribution | UniformDistribution
    >
  >;
  afterTaxContributionLimit: number;
  setAfterTaxContributionLimit: React.Dispatch<React.SetStateAction<number>>;
  spendingStrategy: string[];
  setSpendingStrategy: React.Dispatch<React.SetStateAction<string[]>>;
  expenseWithdrawalStrategy: string[];
  setExpenseWithdrawalStrategy: React.Dispatch<React.SetStateAction<string[]>>;
  RMDStrategy: string[];
  setRMDStrategy: React.Dispatch<React.SetStateAction<string[]>>;
  RothConversionOpt: boolean;
  setRothConversionOpt: React.Dispatch<React.SetStateAction<boolean>>;
  RothConversionStart: number;
  setRothConversionStart: React.Dispatch<React.SetStateAction<number>>;
  RothConversionEnd: number;
  setRothConversionEnd: React.Dispatch<React.SetStateAction<number>>;
  RothConversionStrategy: string[];
  setRothConversionStrategy: React.Dispatch<React.SetStateAction<string[]>>;
  financialGoal: number;
  setFinancialGoal: React.Dispatch<React.SetStateAction<number>>;
  residenceState: string;
  setResidenceState: React.Dispatch<React.SetStateAction<string>>;
  editScenario: any;
  setEditScenario: React.Dispatch<React.SetStateAction<any>>;
  editInvestmentType: any;
  setEditInvestmentType: React.Dispatch<React.SetStateAction<any>>;
  editEventSeries: any;
  setEditEventSeries: React.Dispatch<React.SetStateAction<any>>;
  editInflationAssumption: any;
  setEditInflationAssumption: React.Dispatch<React.SetStateAction<any>>;
}

// Create Context
const ScenarioContext = createContext<ScenarioContextType>(
  {} as ScenarioContextType
);
export const useScenarioContext = () => useContext(ScenarioContext);

// Provider
export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Scenario-level fields
  const [name, setName] = useState<string>("sup");
  const [maritalStatus, setMaritalStatus] = useState<"individual" | "couple">(
    "individual"
  );
  const [birthYears, setBirthYears] = useState<number[]>([1985]);

  const [lifeExpectancy, setLifeExpectancy] = useState<
    (FixedDistribution | NormalDistribution | UniformDistribution)[]
  >([{ type: "fixed", value: 80 }]);

  // Changed from arrays to Record<string, T> to match schema
  const [investmentTypes, setInvestmentTypes] = useState<
    Record<string, InvestmentType>
  >({});
  const [investments, setInvestments] = useState<Record<string, Investment>>({
    cash: {
      investmentType: "cash",
      value: 0,
      taxStatus: "non-retirement",
      id: "cash",
    },
  });
  const [eventSeries, setEventSeries] = useState<Record<string, Event>>({});

  // Inflation assumption
  const [inflationAssumption, setInflationAssumption] = useState<
    FixedDistribution | NormalDistribution | UniformDistribution
  >({
    type: "fixed",
    value: 0.03,
  });

  // Strategy-related fields
  const [afterTaxContributionLimit, setAfterTaxContributionLimit] =
    useState<number>(0);
  const [spendingStrategy, setSpendingStrategy] = useState<string[]>([]);
  const [expenseWithdrawalStrategy, setExpenseWithdrawalStrategy] = useState<
    string[]
  >([]);
  const [RMDStrategy, setRMDStrategy] = useState<string[]>([]);

  // Roth conversion
  const [RothConversionOpt, setRothConversionOpt] = useState<boolean>(false);
  const [RothConversionStart, setRothConversionStart] = useState<number>(0);
  const [RothConversionEnd, setRothConversionEnd] = useState<number>(0);
  const [RothConversionStrategy, setRothConversionStrategy] = useState<
    string[]
  >([]);

  // Goal & Location
  const [financialGoal, setFinancialGoal] = useState<number>(0);
  const [residenceState, setResidenceState] = useState<string>("NY");

  // Edit
  const [editScenario, setEditScenario] = useState(null);
  const [editInvestmentType, setEditInvestmentType] = useState(null);
  const [editEventSeries, setEditEventSeries] = useState(null);
  const [editInflationAssumption, setEditInflationAssumption] = useState(null);
  return (
    <ScenarioContext.Provider
      value={{
        name,
        setName,
        maritalStatus,
        setMaritalStatus,
        birthYears,
        setBirthYears,
        lifeExpectancy,
        setLifeExpectancy,
        investmentTypes,
        setInvestmentTypes,
        investments,
        setInvestments,
        eventSeries,
        setEventSeries,
        inflationAssumption,
        setInflationAssumption,
        afterTaxContributionLimit,
        setAfterTaxContributionLimit,
        spendingStrategy,
        setSpendingStrategy,
        expenseWithdrawalStrategy,
        setExpenseWithdrawalStrategy,
        RMDStrategy,
        setRMDStrategy,
        RothConversionOpt,
        setRothConversionOpt,
        RothConversionStart,
        setRothConversionStart,
        RothConversionEnd,
        setRothConversionEnd,
        RothConversionStrategy,
        setRothConversionStrategy,
        financialGoal,
        setFinancialGoal,
        residenceState,
        setResidenceState,
        editScenario,
        setEditScenario,
        editInvestmentType,
        setEditInvestmentType,
        editEventSeries,
        setEditEventSeries,
        editInflationAssumption,
        setEditInflationAssumption,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};
