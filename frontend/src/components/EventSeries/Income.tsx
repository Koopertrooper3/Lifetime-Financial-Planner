import { useState } from "react";
import EventSeriesExpectedInput from "../shared/EventSeriesExpectedInput";
import IncomeAllocationInput from "../shared/IncomeAllocationInput";
import "../../stylesheets/EventSeries/Income.css";

interface EventSeriesIncomeProps {
  incomeType: "Social Security" | "Wages";
  setIncomeType: (type: "Social Security" | "Wages") => void;
  initialAmount: string;
  setInitialAmount: (value: string) => void;
  // Distribution props
  distributionType:
    | "Fixed Value/Percentage"
    | "Normal Distribution"
    | "Uniform Distribution";
  setDistributionType: (
    type:
      | "Fixed Value/Percentage"
      | "Normal Distribution"
      | "Uniform Distribution"
  ) => void;
  isFixedAmount: boolean;
  setIsFixedAmount: (isFixedAmount: boolean) => void;
  fixedValue: string;
  setFixedValue: (value: string) => void;
  mean: string;
  setMean: (value: string) => void;
  stdDev: string;
  setStdDev: (value: string) => void;
  lowerBound: string;
  setLowerBound: (value: string) => void;
  upperBound: string;
  setUpperBound: (value: string) => void;
  // Allocation props
  applyInflation: boolean;
  setToggleInflation: (apply: boolean) => void;
  userPercentage: number;
  setUserPercentage: (value: number) => void;
  spousePercentage: number;
  setSpousePercentage: (value: number) => void;
}

export default function EventSeriesIncome({
  incomeType,
  setIncomeType,
  initialAmount,
  setInitialAmount,
  distributionType,
  setDistributionType,
  isFixedAmount,
  setIsFixedAmount,
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
  setToggleInflation,
  userPercentage,
  setUserPercentage,
  spousePercentage,
  setSpousePercentage,
}: EventSeriesIncomeProps) {
  return (
    <div className="event-series-income-container">
      <div className="title-with-info">
        <h3 className="purple-title">Income</h3>
        <p className="grayed-text">Dividends, interest, rental income, etc.</p>
      </div>

      {/*Type of income*/}
      <div>
        <label className="option">
          <input
            type="radio"
            id="incomeType"
            value="Social Security"
            checked={incomeType == "Social Security"}
          ></input>
          Social Security
        </label>
        <label className="option">
          <input
            type="radio"
            id="incomeType"
            value="Wages"
            checked={incomeType == "Wages"}
          ></input>
          Wages
        </label>
      </div>

      <div>
        <p>Enter the Initial Amount</p>
        <input
          className="textbox"
          placeholder="Enter a dollar amount (eg. $50)"
        />
      </div>

      <div>
        <p>
          Choose how to expected Annual Change in amount for this income.{" "}
          <span className="grayed-text">
            You can enter a fixed amount or percentage, a value sampled from a
            normal or uniform distribution.
          </span>
        </p>
        {/*Different distribution types*/}
        <div className="type-container">
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
        </div>

        {
          <EventSeriesExpectedInput
            distributionType={distributionType}
            setDistributionType={setDistributionType}
            isFixedAmount={isFixedAmount}
            setIsFixedAmount={setIsFixedAmount}
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

        <IncomeAllocationInput
          applyInflation={applyInflation}
          onToggleInflation={setToggleInflation}
          userPercentage={userPercentage}
          onUserPercentageChange={setUserPercentage}
          spousePercentage={spousePercentage}
          onSpousePercentageChange={setSpousePercentage}
        />
      </div>
    </div>
  );
}
