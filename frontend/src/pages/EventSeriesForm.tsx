import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import CenteredFormWrapper from "../wrapper/CenteredFormWrapper";
import EventSeriesIncome from "../components/EventSeries/Income";
import EventSeriesExpense from "../components/EventSeries/Expense";
import EventSeriesInvest from "../components/EventSeries/Invest";
import "../stylesheets/EventSeries/AddNewEventSeries.css";
import EventSeriesRebalance from "../components/EventSeries/Rebalance";
import ValidationTextFields from "../components/shared/ValidationTextFields";

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

interface EventSeriesFormProps {
  isEditMode?: boolean;
  eventSeries?: any;
}

export default function EventSeriesForm({
  isEditMode,
  eventSeries,
}: EventSeriesFormProps) {
  const [eventSeriesName, setEventSeriesName] = useState<string | number>("");
  const [eventSeriesDescription, setEventSeriesDescription] = useState<
    string | number
  >("");

  // Year
  const [startYearModel, setStartYearModel] = useState("Fixed Value");
  const [startYear, setStartYear] = useState<string | number>("");
  const [meanYear, setMeanYear] = useState<string | number>("");
  const [stdDevYear, setStdDevYear] = useState<string | number>("");
  const [lowerBoundYear, setLowerBoundYear] = useState<string | number>("");
  const [upperBoundYear, setUpperBoundYear] = useState<string | number>("");

  // Duration
  const [durationType, setDurationType] = useState("Fixed Value");
  const [duration, setDuration] = useState<string | number>("");
  const [meanDuration, setMeanDuration] = useState<string | number>("");
  const [stdDuration, setStdDuration] = useState<string | number>("");
  const [lowerBoundDuration, setLowerBoundDuration] = useState<string | number>(
    ""
  );
  const [upperBoundDuration, setUpperBoundDuration] = useState<string | number>(
    ""
  );

  const [eventType, setEventType] = useState("Income");

  // Income-specific states
  const [incomeType, setIncomeType] = useState<"Social Security" | "Wages">(
    "Social Security"
  );
  const [incomeInitialValue, setIncomeInitialValue] = useState<string | number>(
    ""
  );
  const [incomeDistributionType, setIncomeDistributionType] = useState<
    "Fixed Value/Percentage" | "Normal Distribution" | "Uniform Distribution"
  >("Fixed Value/Percentage");
  const [isFixedIncomeAmount, setIsFixedIncomeAmount] = useState(false);
  const [fixedIncomeValue, setFixedIncomeValue] = useState<string | number>("");
  const [incomeMean, setIncomeMean] = useState<string | number>("");
  const [incomeStdDev, setIncomeStdDev] = useState<string | number>("");
  const [incomeLowerBound, setIncomeLowerBound] = useState<string | number>("");
  const [incomeUpperBound, setIncomeUpperBound] = useState<string | number>("");
  const [applyInflation, setApplyInflation] = useState(true);
  const [userPercentage, setUserPercentage] = useState(100);
  const [spousePercentage, setSpousePercentage] = useState(0);

  // Expense-specific states
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

  // Invest specific states
  const [investAllocationType, setInvestAllocationType] = useState<
    "Fixed" | "Glide Path"
  >("Fixed");
  const [investments, setInvestments] =
    useState<Investment[]>(defaultInvestments);
  const [investStartYear, setInvestStartYear] = useState("");
  const [investEndYear, setInvestEndYear] = useState("");
  const [investMaxCashHoldings, setInvestMaxCashHoldings] = useState("");

  // Rebalance specific states
  const [allocationType, setAllocationType] = useState<"Fixed" | "Glide Path">(
    "Fixed"
  );
  const [rebalanceStartYear, setRebalanceStartYear] = useState("");
  const [rebalanceEndYear, setRebalanceEndYear] = useState("");
  const [rebalanceMaxCashHoldings, setRebalanceMaxCashHoldings] = useState("");

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
          <Link to="/scenarioFormPage" className="back-link">
            {"<<"}Back
          </Link>
        </div>

        {/*Investment Name*/}
        <div className="event-series-name-container">
          <h3 className="purple-title">Event Series Name</h3>
          <ValidationTextFields
            placeholder="e.g., Retirement Income, Child's College Fund, S&P 500 ETF"
            setInput={setEventSeriesName}
            inputType="string"
            width="100%"
            height="1.4375em"
            disabled={false}
          />
        </div>

        {/*Description*/}
        <div className="event-series-description-container">
          <h3 className="purple-title">Description</h3>
          <ValidationTextFields
            placeholder="Describe your event series, e.g. Provides fixed annual income until age 65"
            setInput={setEventSeriesDescription}
            inputType="string"
            width="100%"
            height="150px"
            disabled={false}
          />
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
              <div className="input-label">Enter the Start Year</div>
              <ValidationTextFields
                placeholder="Enter a fixed year (e.g. 2024)"
                setInput={setStartYear}
                inputType="number"
                width="100%"
                height="1.4375em"
                disabled={false}
              />
            </div>
          )}

          {startYearModel === "Normal Distribution" && (
            <div>
              <div className="input-container">
                <div className="input-label">Enter Mean Year</div>
                <ValidationTextFields
                  placeholder="Enter year (e.g., 2024)"
                  setInput={setMeanYear}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>

              <div className="input-container">
                <div className="input-label">Enter Standard Deviation</div>
                <ValidationTextFields
                  placeholder="Enter standard deviation (e.g., 2)"
                  setInput={setStdDevYear}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>
            </div>
          )}

          {startYearModel === "Uniform Distribution" && (
            <div>
              <div className="input-container">
                <div className="input-label">Enter Lower Bound Year</div>
                <ValidationTextFields
                  placeholder="Enter year (e.g., 2024)"
                  setInput={setLowerBoundYear}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>

              <div className="input-container">
                <div className="input-label">Enter Upper Bound Year</div>
                <ValidationTextFields
                  placeholder="Enter year (e.g., 2025)"
                  setInput={setUpperBoundYear}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
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

          <div className="type-container">
            <label className="option">
              <input
                type="radio"
                id="durationType"
                value="Fixed Value"
                onChange={() => {
                  setDurationType("Fixed Value");
                }}
                checked={durationType == "Fixed Value"}
              ></input>
              Fixed Value
            </label>
            <label className="option">
              <input
                type="radio"
                id="durationType"
                value="Normal Distribution"
                onChange={() => {
                  setDurationType("Normal Distribution");
                }}
                checked={durationType == "Normal Distribution"}
              ></input>
              Normal Distribution
            </label>
            <label className="option">
              <input
                type="radio"
                id="durationType"
                value="Uniform Distribution"
                onChange={() => {
                  setDurationType("Uniform Distribution");
                }}
                checked={durationType == "Uniform Distribution"}
              ></input>
              Uniform Distribution
            </label>
          </div>

          {durationType === "Fixed Value" && (
            <div className="input-group">
              <div className="input-label">Enter the Duration</div>
              {/* <input
              className="textbox"
              placeholder="Enter a number of year (e.g. 10)"
              onChange={(e) => setDurationFixedValue(e.target.value)}
            /> */}
              <ValidationTextFields
                placeholder="Enter a number of year (e.g. 10)"
                setInput={setDuration}
                inputType="number"
                width="100%"
                height="1.4375em"
                disabled={false}
              />
            </div>
          )}

          {durationType === "Normal Distribution" && (
            <div>
              <div className="input-container">
                <div className="input-label">Enter Mean Year</div>
                <ValidationTextFields
                  placeholder="Enter a number of year (e.g. 10)"
                  setInput={setMeanDuration}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>

              <div className="input-container">
                <div className="input-label">Enter Standard Deviation</div>
                <ValidationTextFields
                  placeholder="Enter standard deviation (e.g., 2)"
                  setInput={setStdDuration}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>
            </div>
          )}

          {durationType === "Uniform Distribution" && (
            <div>
              <div className="input-container">
                <div className="input-label">Enter Duration Lower Bound</div>
                <ValidationTextFields
                  placeholder="Enter year (e.g., 5)"
                  setInput={setLowerBoundDuration}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>

              <div className="input-container">
                <div className="input-label">Enter Duration Upper Bound</div>
                <ValidationTextFields
                  placeholder="Enter year (e.g., 10)"
                  setInput={setUpperBoundDuration}
                  inputType="number"
                  width="100%"
                  height="1.4375em"
                  disabled={false}
                />
              </div>
            </div>
          )}
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
              expenseInitialAmount={expenseInitialAmount}
              setExpenseInitialAmount={setExpenseInitialAmount}
              expenseDistributionType={expenseDistributionType}
              setExpenseDistributionType={setExpenseDistributionType}
              isExpenseAmount={isExpenseAmount}
              setIsExpenseAmount={setIsExpenseAmount}
              expenseFixedValue={expenseFixedValue}
              setExpenseFixedValue={setExpenseFixedValue}
              expenseMean={expenseMean}
              setExpenseMean={setExpenseMean}
              expenseStdDev={expenseStdDev}
              setExpenseStdDev={setExpenseStdDev}
              expenseLowerBound={expenseLowerBound}
              setExpenseLowerBound={setExpenseLowerBound}
              expenseUpperBound={expenseUpperBound}
              setExpenseUpperBound={setExpenseUpperBound}
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
              startYear={investStartYear}
              setStartYear={setInvestStartYear}
              endYear={investEndYear}
              setEndYear={setInvestEndYear}
              maxCashHoldings={investMaxCashHoldings}
              setMaxCashHoldings={setInvestMaxCashHoldings}
            ></EventSeriesInvest>
          )}

          {eventType === "Rebalance" && (
            <EventSeriesRebalance
              allocationType={allocationType}
              setAllocationType={setAllocationType}
              investments={investments}
              setInvestments={setInvestments}
              startYear={rebalanceStartYear}
              setStartYear={setRebalanceStartYear}
              endYear={rebalanceEndYear}
              setEndYear={setRebalanceEndYear}
              maxCashHoldings={rebalanceMaxCashHoldings}
              setMaxCashHoldings={setRebalanceMaxCashHoldings}
            ></EventSeriesRebalance>
          )}
        </div>

        <div className="save-event-series-container">
          <button className="save-event-series-button">
            Save Event Series
          </button>
        </div>
      </CenteredFormWrapper>
    </motion.div>
  );
}
