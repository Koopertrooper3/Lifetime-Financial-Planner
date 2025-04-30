import { useEffect, useState } from "react";
import ToggleSwitch from "../shared/ToggleSwitch";
import EventSeriesExpectedInput from "../shared/EventSeriesExpectedInput";
import IncomeAllocationInput from "../shared/IncomeAllocationInput";
import "../../stylesheets/EventSeries/Expense.css";
import { EventSeriesExpenseProps } from "../../interfaces/EventSeries/EventSeriesExpenseProps";
import { useScenarioContext } from "../../useScenarioContext";
import ValidationTextFields from "../shared/ValidationTextFields";

export default function EventSeriesExpense({
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
  applyInflation,
  setInflation,
  userPercentage,
  setUserPercentage,
  spousePercentage,
  setSpousePercentage,
}: EventSeriesExpenseProps) {
  const { editEventSeries } = useScenarioContext();

  const mapDistributionTypeToLabel = (
    type: string
  ):
    | "Fixed Value/Percentage"
    | "Normal Distribution"
    | "Uniform Distribution" => {
    if (type === "normal") return "Normal Distribution";
    if (type === "fixed") return "Fixed Value/Percentage";
    if (type === "uniform") return "Uniform Distribution";
    return "Fixed Value/Percentage"; // Default value instead of "undefined"
  };

  useEffect(() => {
    setIsDiscretionary(editEventSeries.event.discretionary || false);
    setExpenseInitialAmount(editEventSeries.event.initialAmount || 0);
    setExpenseDistributionType(
      mapDistributionTypeToLabel(editEventSeries.event.changeDistribution)
    );
  }, [editEventSeries]);

  return (
    <div className="event-series-expense-container">
      <div className="title-with-info">
        <h3 className="purple-title">Expense</h3>
        <p className="grayed-text">
          Rent, food, transportation, insurance, and other living costs.
        </p>
      </div>

      <div className="discretionary-expense-container">
        <div className="toggle-container">
          <p>Is this a discretionary expense?</p>
          <ToggleSwitch
            checked={isDiscretionary}
            onChange={() => setIsDiscretionary(!isDiscretionary)}
          ></ToggleSwitch>
        </div>
        <p className="grayed-text">
          Click the toggle <span className="green-word">on</span> for
          discretionary expenses and <span className="black-word">off</span> for
          necessary expenses. If marked discretionary, this expense will only
          occur in years where it does no cause your portfolio to fall below
          your financial goal.
        </p>

        <div>
          <p>Enter the Initial Amount</p>
          <ValidationTextFields
            value={expenseInitialAmount}
            placeholder="Enter a dollar amount (eg. $50)"
            setInput={setExpenseInitialAmount}
            inputType="number"
            width="100%"
            height="1.4375em"
            disabled={false}
          ></ValidationTextFields>
        </div>
      </div>

      <div>
        <p>
          Choose how to expected Annual Change in amount for this expense.{" "}
          <span className="grayed-text">
            You can enter a fixed value or percentage, a value sample from a
            normal or uniform distribution
          </span>
        </p>
        <div>
          <label className="option">
            <input
              type="radio"
              id="distributionType"
              value="Fixed Value/Percentage"
              onChange={() => {
                setExpenseDistributionType("Fixed Value/Percentage");
              }}
              checked={expenseDistributionType == "Fixed Value/Percentage"}
            ></input>
            Fixed Value/Percentage
          </label>
          <label className="option">
            <input
              type="radio"
              id="distributionType"
              value="Normal Distribution"
              onChange={() => {
                setExpenseDistributionType("Normal Distribution");
              }}
              checked={expenseDistributionType == "Normal Distribution"}
            ></input>
            Normal Distribution
          </label>

          <label className="option">
            <input
              type="radio"
              id="distributionType"
              value="Uniform Distribution"
              onChange={() => {
                setExpenseDistributionType("Uniform Distribution");
              }}
              checked={expenseDistributionType == "Uniform Distribution"}
            ></input>
            Uniform Distribution
          </label>
        </div>
        {
          <EventSeriesExpectedInput
            // distributionType={expenseDistributionType}
            // setDistributionType={setExpenseDistributionType}
            // isFixedAmount={isExpenseAmount}
            // setIsFixedAmount={setIsExpenseAmount}
            // fixedValue={expenseFixedValue}
            // setFixedValue={setExpenseFixedValue}
            // mean={expenseMean}
            // setMean={setExpenseMean}
            // stdDev={expenseStdDev}
            // setStdDev={setExpenseStdDev}
            // lowerBound={expenseLowerBound}
            // setLowerBound={setExpenseLowerBound}
            // upperBound={expenseUpperBound}
            // setUpperBound={setExpenseUpperBound}
          ></EventSeriesExpectedInput>
        }
        {
          <IncomeAllocationInput
            applyInflation={applyInflation}
            setApplyInflation={setInflation}
            userPercentage={userPercentage}
            setUserPercentage={setUserPercentage}
            spousePercentage={spousePercentage}
            setSpousePercentage={setSpousePercentage}
          />
        }
      </div>
    </div>
  );
}
