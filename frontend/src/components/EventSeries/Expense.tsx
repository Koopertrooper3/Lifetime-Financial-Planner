import { useState } from "react";
import ToggleSwitch from "../shared/ToggleSwitch";
import EventSeriesExpectedInput from "../shared/EventSeriesExpectedInput";
import IncomeAllocationInput from "../shared/IncomeAllocationInput";
import "../../stylesheets/EventSeries/Expense.css";

type DistributionType =
  | "Fixed Value/Percentage"
  | "Normal Distribution"
  | "Uniform Distribution";

interface EventSeriesExpenseProps {
  // Discretionary Expense
  isDiscretionary: boolean;
  setIsDiscretionary: (value: boolean) => void;

  // Initial Amount
  initialAmount: string;
  setInitialAmount: (value: string) => void;

  // Distribution Configuration
  distributionType: DistributionType;
  setDistributionType: (value: DistributionType) => void;
  isAmount: boolean;
  setIsAmount: (value: boolean) => void;

  // Fixed Value/Percentage
  fixedValue?: string;
  setFixedValue?: (value: string) => void;

  // Normal Distribution
  mean?: string;
  setMean?: (value: string) => void;
  stdDev?: string;
  setStdDev?: (value: string) => void;

  // Uniform Distribution
  lowerBound?: string;
  setLowerBound?: (value: string) => void;
  upperBound?: string;
  setUpperBound?: (value: string) => void;

  // Inflation Adjustment
  applyInflation: boolean;
  setInflation: (value: boolean) => void;

  // Expense Allocation
  userPercentage: number;
  setUserPercentage: (value: number) => void;
  spousePercentage: number;
  setSpousePercentage: (value: number) => void;
}

export default function EventSeriesExpense({
  isDiscretionary,
  setIsDiscretionary,
  initialAmount,
  setInitialAmount,
  distributionType,
  setDistributionType,
  isAmount,
  setIsAmount,
  fixedValue,
  setFixedValue,
  mean,
  setMean,
  stdDev,
  setStdDev,
  lowerBound,
  setLowerBound,
  upperBound,
  setUpperBound,
  applyInflation,
  setInflation,
  userPercentage,
  setUserPercentage,
  spousePercentage,
  setSpousePercentage,
}: EventSeriesExpenseProps) {
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
          <input
            className="textbox"
            placeholder="Enter a dollar amount (eg. $50)"
            onChange={(e) => setInitialAmount(e.target.value)}
          ></input>
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
                setDistributionType("Fixed Value/Percentage");
              }}
              checked={distributionType == "Fixed Value/Percentage"}
            ></input>
            Fixed Value/Percentage
          </label>
          <label className="option">
            <input
              type="radio"
              id="distributionType"
              value="Normal Distribution"
              onChange={() => {
                setDistributionType("Normal Distribution");
              }}
              checked={distributionType == "Normal Distribution"}
            ></input>
            Normal Distribution
          </label>

          <label className="option">
            <input
              type="radio"
              id="distributionType"
              value="Uniform Distribution"
              onChange={() => {
                setDistributionType("Uniform Distribution");
              }}
              checked={distributionType == "Uniform Distribution"}
            ></input>
            Uniform Distribution
          </label>
        </div>
        {
          <EventSeriesExpectedInput
            distributionType={distributionType}
            setDistributionType={setDistributionType}
            isFixedAmount={isAmount}
            setIsFixedAmount={setIsAmount}
            fixedValue={fixedValue}
            setFixedValue={setFixedValue}
            mean={mean}
            setMean={setMean}
            stdDev={stdDev}
            setStdDev={setStdDev}
            lowerBound={lowerBound}
            setLowerBound={setLowerBound}
            upperBound={upperBound}
            setUpperBound={setUpperBound}
          ></EventSeriesExpectedInput>
        }
        {
          <IncomeAllocationInput
            applyInflation={applyInflation}
            onToggleInflation={setInflation}
            userPercentage={userPercentage}
            onUserPercentageChange={setUserPercentage}
            spousePercentage={spousePercentage}
            onSpousePercentageChange={setSpousePercentage}
          />
        }
      </div>
    </div>
  );
}
