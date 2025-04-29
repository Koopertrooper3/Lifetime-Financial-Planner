import { useState, useEffect } from "react";
import EventSeriesExpectedInput from "../shared/EventSeriesExpectedInput";
import IncomeAllocationInput from "../shared/IncomeAllocationInput";
import "../../stylesheets/EventSeries/Income.css";
import { EventSeriesIncomeProps } from "../../interfaces/EventSeries/EventSeriesIncomeProps";
import { useEventSeriesFormHooks } from "../../hooks/useEventSeriesFormHooks";
import { useScenarioContext } from "../../useScenarioContext";
import ValidationTextFields from "../shared/ValidationTextFields";

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
  setApplyInflation,
  userPercentage,
  setUserPercentage,
  spousePercentage,
  setSpousePercentage
}: EventSeriesIncomeProps) {
  const { editEventSeries } = useScenarioContext();

  useEffect(() => {
    if (editEventSeries) {
      setIncomeType(
        editEventSeries.event.socialSecurity === true
          ? "Social Security"
          : "Wages"
      );
      setInitialAmount(editEventSeries.event.initialAmount || 0);
    }
  }, [editEventSeries]);

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
            onChange={() => setIncomeType("Social Security")}
          ></input>
          Social Security
        </label>
        <label className="option">
          <input
            type="radio"
            id="incomeType"
            value="Wages"
            checked={incomeType == "Wages"}
            onChange={() => setIncomeType("Wages")}
          ></input>
          Wages
        </label>
      </div>

      <div>
        <p>Enter the Initial Amount</p>
        <ValidationTextFields
          value={initialAmount}
          placeholder="Enter a dollar amount (eg. $50)"
          setInput={setInitialAmount}
          inputType="number"
          width="100%"
          height="1.4375em"
          disabled={false}
        ></ValidationTextFields>
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
          setApplyInflation={setApplyInflation}
          userPercentage={userPercentage}
          setUserPercentage={setUserPercentage}
          spousePercentage={spousePercentage}
          setSpousePercentage={setSpousePercentage}
        />
      </div>
    </div>
  );
}
