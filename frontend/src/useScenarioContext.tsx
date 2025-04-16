import React, { createContext, useContext, useState } from "react";

interface LifeExpectancyModel {
  type: "Fixed" | "Normal";
  value?: number;
  mean?: number;
  stdev?: number;
}

export interface InvestmentType {
  name: string;
  description: string;
  returnAmtOrPct: "Amount" | "Percent";
  returnDistribution: InvestmentTypeDistribution;
  expenseRatio: number;
  incomeAmtOrPct: "Amount" | "Percent";
  incomeDistribution: InvestmentTypeDistribution;
  taxability: boolean;
}

export interface Investment {
  investmentType: string;
  value: number;
  taxStatus: "Non-retirement" | "Pre-tax" | "After-tax";
  id: string;
}

interface eventBased {
  type: "EventBased";
  withOrAfter: "With" | "After";
  event: string;
}
export type eventStartType = EventSeriesDistribution | eventBased;

export interface EventSeries {
  name: string;
  start: eventStartType;
  duration: EventSeriesDistribution;
  event: IncomeEvent | ExpenseEvent | InvestEvent | RebalanceEvent;
}

export interface FixedDistribution {
  type: "Fixed";
  value: number;
}

export interface NormalDistribution {
  type: "Normal";
  mean: number;
  stdev: number;
}

export interface UniformDistribution {
  type: "Uniform";
  min: number;
  max: number;
}

export type InvestmentTypeDistribution = FixedDistribution | NormalDistribution;

export type EventSeriesDistribution =
  | FixedDistribution
  | NormalDistribution
  | UniformDistribution;

export interface IncomeEvent {
  type: "Income";
  initialAmount: number;
  changeAmountOrPercent: "Amount" | "Percent";
  changeDistribution: EventSeriesDistribution;
  inflationAdjusted: boolean;
  userFraction: number;
  socialSecurity: boolean;
}

export interface ExpenseEvent {
  type: "Expense";
  initialAmount: number;
  changeAmountOrPercent: "Amount" | "Percent";
  changeDistribution: EventSeriesDistribution;
  inflationAdjusted: boolean;
  userFraction: number;
  discretionary: boolean;
}

export interface assetProportion {
  asset: string;
  proportion: number;
}

export interface InvestEvent {
  type: "Invest";
  assetAllocation: assetProportion[];
  glidePath: boolean;
  assetAllocation2?: assetProportion[];
  maxCash: number;
}

type TaxStatus = "Pre-Tax" | "After-Tax" | "Non-Retirement";
export interface RebalanceEvent {
  type: "Rebalance";
  taxStatus: TaxStatus;
  assetAllocation: assetProportion[];
  glidePath: boolean;
  assetAllocation2?: assetProportion[];
}

export interface ScenarioInterface {
  name: string;
  maritalStatus: "individual" | "couple";
  birthYear: number[];
  lifeExpectancy: LifeExpectancyModel[];
  investmentTypes: Record<string, InvestmentType>;
  investments: Record<string, Investment>;
  eventSeries: Record<string, EventSeries>;
  inflationAssumption: { type: string; value: number };
  afterTaxContributionLimit: number;
  spendingStrategy: string[];
  expenseWithdrawalStrategy: string[];
  RMDStrategy: string[];
  RothConversionOpt: boolean;
  RothConversionStart: number;
  RothConversionEnd: number;
  RothConversionStrategy: string[];
  financialGoal: number;
  residenceState: string;
}

// Context Type
interface ScenarioContextType {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  maritalStatus: "individual" | "couple";
  setMaritalStatus: React.Dispatch<
    React.SetStateAction<"individual" | "couple">
  >;
  birthYear: number[];
  setBirthYear: React.Dispatch<React.SetStateAction<number[]>>;
  lifeExpectancy: LifeExpectancyModel[];
  setLifeExpectancy: React.Dispatch<
    React.SetStateAction<LifeExpectancyModel[]>
  >;
  investmentTypes: Record<string, InvestmentType>;
  setInvestmentTypes: React.Dispatch<
    React.SetStateAction<Record<string, InvestmentType>>
  >;
  investments: Record<string, Investment>;
  setInvestments: React.Dispatch<
    React.SetStateAction<Record<string, Investment>>
  >;
  eventSeries: Record<string, EventSeries>;
  setEventSeries: React.Dispatch<
    React.SetStateAction<Record<string, EventSeries>>
  >;
  inflationAssumption: { type: string; value: number };
  setInflationAssumption: React.Dispatch<
    React.SetStateAction<{ type: string; value: number }>
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
  const [birthYear, setBirthYear] = useState<number[]>([1985]);

  // Life Expectancy (e.g. [{ type: "Fixed", value: 80 }])
  const [lifeExpectancy, setLifeExpectancy] = useState<
    {
      type: "Fixed" | "Normal";
      value?: number;
      mean?: number;
      stdev?: number;
    }[]
  >([{ type: "Fixed", value: 80 }]);

  // Investment Types and Investments (use Record<string, any> for now, or define types later)
  const [investmentTypes, setInvestmentTypes] = useState<Record<string, any>>(
    {}
  );
  const [investments, setInvestments] = useState<Record<string, any>>({});

  // Event Series
  const [eventSeries, setEventSeries] = useState<Record<string, any>>({});

  // Inflation assumption
  const [inflationAssumption, setInflationAssumption] = useState<{
    type: string;
    value: number;
  }>({
    type: "Fixed",
    value: 0,
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

  return (
    <ScenarioContext.Provider
      value={{
        name,
        setName,
        maritalStatus,
        setMaritalStatus,
        birthYear,
        setBirthYear,
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
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};
