import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CenteredFormWrapper from "../wrapper/CenteredFormWrapper";
import EventSeriesIncome from "../components/EventSeries/Income";
import EventSeriesExpense from "../components/EventSeries/Expense";
import EventSeriesInvest from "../components/EventSeries/Invest";
import "../stylesheets/EventSeries/AddNewEventSeries.css";
import EventSeriesRebalance from "../components/EventSeries/Rebalance";

type Investment = {
  id: string;
  name: string;
  initialAllocation?: number;
  finalAllocation?: number;
};

const defaultInvestments = [
  { id: "1", name: "S&P 500 ETF", initialAllocation: 0, finalAllocation: 0 },
  {
    id: "2",
    name: "Corporate Bonds",
    initialAllocation: 0,
    finalAllocation: 0,
  },
  {
    id: "3",
    name: "Real Estate Fund",
    initalAllocation: 0,
    finalAllocation: 0,
  },
];

export default function AddNewEventSeries() {
  const [eventSeriesName, setEventSeriesName] = useState("");
  const [eventSeriesDescription, setEventSeriesDescription] = useState("");

  const [startYearModel, setStartYearModel] = useState("Fixed Value");
  const [startYear, setStartYear] = useState("");
  const [meanYear, setMeanYear] = useState("");
  const [stdDevYear, setStdDevYear] = useState("");
  const [lowerBoundYear, setLowerBoundYear] = useState("");
  const [upperBoundYear, setUpperBoundYear] = useState("");

  const [durationModel, setDurationModel] = useState("Fixed Value");

  const [eventType, setEventType] = useState("Income");

  // Income-specific states
  const [incomeType, setIncomeType] = useState<"Social Security" | "Wages">(
    "Social Security"
  );
  const [incomeInitialValue, setIncomeInitialValue] = useState("");
  const [incomeDistributionType, setIncomeDistributionType] = useState<
    "Fixed Value/Percentage" | "Normal Distribution" | "Uniform Distribution"
  >("Fixed Value/Percentage");
  const [isFixedIncomeAmount, setIsFixedIncomeAmount] = useState(false);
  const [fixedIncomeValue, setFixedIncomeValue] = useState("");
  const [incomeMean, setIncomeMean] = useState("");
  const [incomeStdDev, setIncomeStdDev] = useState("");
  const [incomeLowerBound, setIncomeLowerBound] = useState("");
  const [incomeUpperBound, setIncomeUpperBound] = useState("");
  const [applyInflation, setApplyInflation] = useState(true);
  const [userPercentage, setUserPercentage] = useState(100);
  const [spousePercentage, setSpousePercentage] = useState(0);

  // Expense-specific states
  const [isDiscretionary, setIsDiscretionary] = useState(false);
  const [expenseInitialAmount, setExpenseInitialAmount] = useState("");
  const [expenseDistributionType, setExpenseDistributionType] = useState<
    "Fixed Value/Percentage" | "Normal Distribution" | "Uniform Distribution"
  >("Fixed Value/Percentage");
  const [isExpenseAmount, setIsExpenseAmount] = useState(false);
  const [expenseFixedValue, setExpenseFixedValue] = useState("");
  const [expenseMean, setExpenseMean] = useState("");
  const [expenseStdDev, setExpenseStdDev] = useState("");
  const [expenseLowerBound, setExpenseLowerBound] = useState("");
  const [expenseUpperBound, setExpenseUpperBound] = useState("");

  // Invest specific states
  const [allocationType, setAllocationType] = useState<"Fixed" | "Glide Path">(
    "Fixed"
  );
  const [investments, setInvestments] =
    useState<Investment[]>(defaultInvestments);
  const [investmentStartYear, setInvestmentStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [maxCashHoldings, setMaxCashHoldings] = useState("");

  return (
    <motion.div
      initial={{ x: window.innerWidth }}
      animate={{ x: 0 }}
      exit={{ x: 0 }}
      transition={{ duration: 0.3 }}
      
    >
    <CenteredFormWrapper>
      {/*Title*/}
      <div className="header-line">
        <h2 className="header">Add New Event Series</h2>
        <Link to="/dashboard/createScenario" className="back-link">
          {"<<"}Back
        </Link>
      </div>

      {/*Investment Name*/}
      <div className="event-series-name-container">
        <h3 className="purple-title">Event Series Name</h3>
        <input
          className="textbox event-series-name-textbox"
          type="text"
          placeholder="e.g., Retirement Income, Child's College Fund, S&P 500 ETF"
        ></input>
      </div>

      {/*Description*/}
      <div className="event-series-description-container">
        <h3 className="purple-title">Description</h3>
        <textarea
          className="textbox event-series-description-textbox"
          placeholder="Describe your event series, e.g. Provides fixed annual income until age 65"
        ></textarea>
      </div>

      {/*Expected Start Year*/}
      <div className="expected-start-year-container">
        <div className="title-with-info">
          <h3 className="purple-title">Expected Start Year</h3>
          <span className="grayed-text">Start Year</span>
        </div>

        {/*Expected Start Year Description*/}
        <div className="start-year-description-container">
          <span className="black-text">
            Choose how to model the expected start year for this event series:{" "}
          </span>
          <span className="grayed-text">
            You can enter a fixed value, a value sampled from a normal or
            uniform distribution, or use advanced settings to select the same
            year that a specificed event series starts, or the year after a
            speicfied event series ends.
          </span>
        </div>

        {/*Different selection types*/}
        <div className="type-container">
          <div>
            <label className="option">
              <input
                type="radio"
                id="startYearModel"
                value="Fixed Value"
                onChange={() => {
                  setStartYearModel("Fixed Value");
                }}
                checked={startYearModel == "Fixed Value"}
              ></input>
              Fixed Value
            </label>
            <label className="option">
              <input
                type="radio"
                id="startYearModel"
                value="Normal Distribution"
                onChange={() => {
                  setStartYearModel("Normal Distribution");
                }}
                checked={startYearModel == "Normal Distribution"}
              ></input>
              Normal Distribution
            </label>
            <label className="option">
              <input
                type="radio"
                id="startYearModel"
                value="Uniform Distribution"
                onChange={() => {
                  setStartYearModel("Uniform Distribution");
                }}
                checked={startYearModel == "Uniform Distribution"}
              ></input>
              Uniform Distribution
            </label>
            <label className="option">
              <input
                type="radio"
                id="startYearModel"
                value="Advanced"
                onChange={() => {
                  setStartYearModel("Advanced");
                }}
                checked={startYearModel == "Advanced"}
              ></input>
              Advanced
            </label>
          </div>
        </div>

        {startYearModel === "Fixed Value" && (
          <div className="input-group">
            <label className="input-label">Enter the Start Year</label>
            <input
              className="textbox"
              placeholder="Enter a fixed year (e.g. 2024)"
              onChange={(e) => setStartYear(e.target.value)}
            />
          </div>
        )}

        {startYearModel === "Normal Distribution" && (
          <div className="input-group">
            <div>
              <label className="input-label">Enter Mean Year</label>
              <input
                className="textbox"
                type="number"
                placeholder="Enter year (e.g., 2024)"
                onChange={(e) => setMeanYear(e.target.value)}
              />
            </div>

            <div>
              <label className="input-label">Enter Standard Deviation</label>
              <input
                className="textbox"
                type="number"
                placeholder="Enter standard deviation (e.g., 2)"
                onChange={(e) => setStdDevYear(e.target.value)}
              />
            </div>
          </div>
        )}

        {startYearModel === "Uniform Distribution" && (
          <div className="input-group">
            <div>
              <label className="input-label">Enter Lower Bound Year</label>
              <input
                className="textbox"
                type="number"
                placeholder="Enter year (e.g., 2024)"
                onChange={(e) => setLowerBoundYear(e.target.value)}
              />
            </div>

            <div>
              <label className="input-label">Enter Upper Bound Year</label>
              <input
                className="textbox"
                type="number"
                placeholder="Enter year (e.g., 2025)"
                onChange={(e) => setUpperBoundYear(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/*Duration*/}
      <div className="duration-container">
        <div className="title-with-info">
          <h3 className="purple-title">Duration</h3>
          <span className="grayed-text">Event Series Duration in Years</span>
        </div>

        <div className="description-container">
          <span className="black-text">
            Choose how to model the duration for this event series.{" "}
          </span>
          <span className="grayed-text">
            You can enter a fixed value or a value sampled from a normal or
            uniform distribution.
          </span>
        </div>
      </div>

      {/*Event Series Type*/}
      <div>
        <h3 className="purple-title">Type</h3>
        <div className="type-container">
          <div>
            <label className="option">
              <input
                type="radio"
                id="eventSeriesType"
                value="Income"
                onChange={() => {
                  setEventType("Income");
                }}
                checked={eventType == "Income"}
              ></input>
              Income
            </label>
            <label className="option">
              <input
                type="radio"
                id="eventSeriesType"
                value="Expense"
                onChange={() => {
                  setEventType("Expense");
                }}
                checked={eventType == "Expense"}
              ></input>
              Expense
            </label>
            <label className="option">
              <input
                type="radio"
                id="eventSeriesType"
                value="Invest"
                onChange={() => {
                  setEventType("Invest");
                }}
                checked={eventType == "Invest"}
              ></input>
              Invest
            </label>
            <label className="option">
              <input
                type="radio"
                id="eventSeriesType"
                value="Rebalance"
                onChange={() => {
                  setEventType("Rebalance");
                }}
                checked={eventType == "Rebalance"}
              ></input>
              Rebalance
            </label>
          </div>
        </div>

        {eventType === "Income" && (
          <EventSeriesIncome
            incomeType={incomeType}
            setIncomeType={setIncomeType}
            initialAmount={incomeInitialValue}
            setInitialAmount={setIncomeInitialValue}
            distributionType={incomeDistributionType}
            setDistributionType={setIncomeDistributionType}
            isFixedAmount={isFixedIncomeAmount}
            setIsFixedAmount={setIsFixedIncomeAmount}
            fixedValue={fixedIncomeValue}
            setFixedValue={setFixedIncomeValue}
            mean={incomeMean}
            setMean={setIncomeMean}
            stdDev={incomeStdDev}
            setStdDev={setIncomeStdDev}
            lowerBound={incomeLowerBound}
            setLowerBound={setIncomeLowerBound}
            upperBound={incomeUpperBound}
            setUpperBound={setIncomeUpperBound}
            applyInflation={applyInflation}
            setToggleInflation={setApplyInflation}
            userPercentage={userPercentage}
            setUserPercentage={setUserPercentage}
            spousePercentage={spousePercentage}
            setSpousePercentage={setSpousePercentage}
          ></EventSeriesIncome>
        )}

        {eventType === "Expense" && (
          <EventSeriesExpense
            isDiscretionary={isDiscretionary}
            setIsDiscretionary={setIsDiscretionary}
            initialAmount={expenseInitialAmount}
            setInitialAmount={setExpenseInitialAmount}
            distributionType={expenseDistributionType}
            setDistributionType={setExpenseDistributionType}
            isAmount={isExpenseAmount}
            setIsAmount={setIsExpenseAmount}
            fixedValue={expenseFixedValue}
            setFixedValue={setExpenseFixedValue}
            mean={expenseMean}
            setMean={setExpenseMean}
            stdDev={expenseStdDev}
            setStdDev={setExpenseStdDev}
            lowerBound={expenseLowerBound}
            setLowerBound={setExpenseLowerBound}
            upperBound={expenseUpperBound}
            setUpperBound={setExpenseUpperBound}
            applyInflation={applyInflation}
            setInflation={setApplyInflation}
            userPercentage={userPercentage}
            setUserPercentage={setUserPercentage}
            spousePercentage={spousePercentage}
            setSpousePercentage={setSpousePercentage}
          ></EventSeriesExpense>
        )}

        {eventType === "Invest" && (
          <EventSeriesInvest
            allocationType={allocationType}
            setAllocationType={setAllocationType}
            investments={investments}
            setInvestments={setInvestments}
            startYear={startYear}
            setStartYear={setStartYear}
            endYear={endYear}
            setEndYear={setEndYear}
            maxCashHoldings={maxCashHoldings}
            setMaxCashHoldings={setMaxCashHoldings}
          ></EventSeriesInvest>
        )}

        {eventType === "Rebalance" && (
          <EventSeriesRebalance
            allocationType={allocationType}
            setAllocationType={setAllocationType}
            investments={investments}
            setInvestments={setInvestments}
            startYear={startYear}
            setStartYear={setStartYear}
            endYear={endYear}
            setEndYear={setEndYear}
            maxCashHoldings={maxCashHoldings}
            setMaxCashHoldings={setMaxCashHoldings}
          ></EventSeriesRebalance>
        )}
      </div>
    </CenteredFormWrapper>
    </motion.div>
  );
}
