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
  setSpousePercentage,
}: EventSeriesIncomeProps) {
  const { editEventSeries } = useScenarioContext();
  const { eventSeriesFormHooks } = useEventSeriesFormHooks();

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
    if (editEventSeries) {
      const {
        setIncomeType,
        setIncomeInitialValue,
        setIncomeDistributionType,
      } = eventSeriesFormHooks;

      setIncomeType(
        editEventSeries.event.socialSecurity === true
          ? "Social Security"
          : "Wages"
      );
      setIncomeInitialValue(editEventSeries.event.initialAmount || 0);
      setIncomeDistributionType(
        mapDistributionTypeToLabel(
          editEventSeries.event.changeDistribution.type
        )
      );
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
            checked={eventSeriesFormHooks.incomeType == "Social Security"}
            onChange={() =>
              eventSeriesFormHooks.setIncomeType("Social Security")
            }
          ></input>
          Social Security
        </label>
        <label className="option">
          <input
            type="radio"
            id="incomeType"
            value="Wages"
            checked={eventSeriesFormHooks.incomeType == "Wages"}
            onChange={() => eventSeriesFormHooks.setIncomeType("Wages")}
          ></input>
          Wages
        </label>
      </div>

      <div>
        <p>Enter the Initial Amount</p>
        <ValidationTextFields
          value={eventSeriesFormHooks.incomeInitialValue}
          placeholder="Enter a dollar amount (eg. $50)"
          setInput={eventSeriesFormHooks.setIncomeInitialValue}
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
                  eventSeriesFormHooks.setIncomeDistributionType(
                    "Fixed Value/Percentage"
                  );
                }}
                checked={
                  eventSeriesFormHooks.incomeDistributionType ==
                  "Fixed Value/Percentage"
                }
              ></input>
              Fixed Value/Percentage
            </label>
            <label className="option">
              <input
                type="radio"
                id="distributionType"
                value="Normal Distribution"
                onChange={() => {
                  eventSeriesFormHooks.setIncomeDistributionType(
                    "Normal Distribution"
                  );
                }}
                checked={
                  eventSeriesFormHooks.incomeDistributionType ==
                  "Normal Distribution"
                }
              ></input>
              Normal Distribution
            </label>
            <label className="option">
              <input
                type="radio"
                id="distributionType"
                value="Uniform Distribution"
                onChange={() => {
                  eventSeriesFormHooks.setIncomeDistributionType(
                    "Uniform Distribution"
                  );
                }}
                checked={
                  eventSeriesFormHooks.incomeDistributionType ==
                  "Uniform Distribution"
                }
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
