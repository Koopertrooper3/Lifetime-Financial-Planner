import ToggleSwitch from "./ToggleSwitch";
import "../../stylesheets/InvestmentType/ExpectedInput.css";
import ValidationTextFields from "./ValidationTextFields";
import { useEffect } from "react";
import { useScenarioContext } from "../../useScenarioContext";
import { useEventSeriesFormHooks } from "../../hooks/useEventSeriesFormHooks";

const EventSeriesExpectedInput = () => {
  const { editEventSeries } = useScenarioContext();
  const { eventSeriesFormHooks } = useEventSeriesFormHooks();
  const {
    incomeDistributionType,
    isFixedIncomeAmount,
    fixedIncomeValue,
    incomeMean,
    incomeStdDev,
    incomeLowerBound,
    incomeUpperBound,
    setIncomeDistributionType,
    setIsFixedIncomeAmount,
    setFixedIncomeValue,
    setIncomeMean,
    setIncomeStdDev,
    setIncomeLowerBound,
    setIncomeUpperBound,
  } = eventSeriesFormHooks;

  useEffect(() => {
    if (editEventSeries) {
      const mapDistributionTypeToLabel = (type: string) => {
        if (type === "normal") return "Normal Distribution";
        if (type === "fixed") return "Fixed Value/Percentage";
        if (type === "uniform") return "Uniform Distribution";
      };

      setIncomeDistributionType(
        mapDistributionTypeToLabel(
          editEventSeries?.event?.changeDistribution?.type
        ) as
          | "Fixed Value/Percentage"
          | "Normal Distribution"
          | "Uniform Distribution"
      );
      setIsFixedIncomeAmount(
        editEventSeries?.event.changeAmtOrPct?.type === "amount"
      );
      setFixedIncomeValue(
        editEventSeries?.event?.changeDistribution?.value?.toString() || ""
      );
      setIncomeMean(
        editEventSeries?.event?.changeDistribution?.mean?.toString() || ""
      );
      setIncomeStdDev(
        editEventSeries?.event?.changeDistribution?.stdev?.toString() || ""
      );
      setIncomeLowerBound(
        editEventSeries?.event?.changeDistribution?.lower?.toString() || ""
      );
      setIncomeUpperBound(
        editEventSeries?.event?.changeDistribution?.upper?.toString() || ""
      );
    }
  }, [editEventSeries]);

  const handleToggleSwitch = () => {
    setIsFixedIncomeAmount(!isFixedIncomeAmount);
  };

  if (incomeDistributionType === "Fixed Value/Percentage") {
    return (
      <div className="expected-input-container">
        <p>Enter Annual Change in amount?</p>
        <div className="toggle-container">
          <div className="grayed-text">
            Click the toggle <span className="green-word">on</span> to enter the
            change as a fixed amount (e.g. $50) and{" "}
            <span className="black-word">off</span> to enter as a percentage
            (e.g. 2%){" "}
            <span>
              <ToggleSwitch
                checked={isFixedIncomeAmount}
                onChange={handleToggleSwitch}
              />
            </span>
          </div>
        </div>
        <ValidationTextFields
          value={fixedIncomeValue}
          placeholder={`Enter ${
            isFixedIncomeAmount
              ? "a dollar amount (e.g. $50)"
              : "a percentage amount (e.g. 0.4%)"
          }`}
          setInput={setFixedIncomeValue}
          inputType="number"
          width="100%"
          height="1.4375em"
          disabled={false}
        />
      </div>
    );
  }

  if (incomeDistributionType == "Normal Distribution") {
    return (
      <div className="expected-input-container">
        <p>
          To model the Annual Change in a normal distribution, enter a mean
          change and standard deviation
        </p>
        <div className="toggle-container">
          <p className="grayed-text">
            <span className="purple-text">$ or %?</span>Click the toggle{" "}
            <span className="green-word">on</span> to enter the mean and
            standard deviation as a fixed amount (eg. $50) and{" "}
            <span className="black-word">off</span> to enter as a percentage
            (e.g. 2%){" "}
            <span>
              <ToggleSwitch
                checked={isFixedIncomeAmount}
                onChange={handleToggleSwitch}
              />
            </span>
          </p>
        </div>
        <div>
          <div className="input-container">
            <p className="textbox-title">Enter the mean</p>
            <ValidationTextFields
              value={incomeMean}
              placeholder={`Enter ${
                isFixedIncomeAmount
                  ? "a dollar amount (e.g. $50)"
                  : "a percentage amount (e.g. 2%)"
              }`}
              setInput={setIncomeMean}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>

          <div className="input-container">
            <p>Enter the standard deviation</p>
            <ValidationTextFields
              value={incomeStdDev}
              placeholder={`Enter ${
                isFixedIncomeAmount
                  ? "a dollar amount (e.g. $50)"
                  : "a percentage amount (e.g. 2%)"
              }`}
              setInput={setIncomeStdDev}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>
        </div>
      </div>
    );
  }

  if (incomeDistributionType == "Uniform Distribution") {
    return (
      <div className="expected-input-container">
        <p>
          To model the Annual Change in a uniform distribution, enter a lower
          bound and an upper bound
        </p>
        <div className="toggle-container">
          <p className="grayed-text">
            <span className="purple-text">$ or %?</span>Click the toggle{" "}
            <span className="green-word">on</span> to enter the lower bound and
            upper bound as a fixed amount (eg. $50) and{" "}
            <span className="black-word">off</span> to enter as a percentage
            (e.g. 2%){" "}
            <span>
              <ToggleSwitch
                checked={isFixedIncomeAmount}
                onChange={handleToggleSwitch}
              />
            </span>
          </p>
        </div>
        <div>
          <div className="input-container">
            <p className="textbox-title">Enter the lower bound</p>
            <ValidationTextFields
              value={incomeLowerBound}
              placeholder={`Enter ${
                isFixedIncomeAmount
                  ? "a dollar amount (e.g. $50)"
                  : "a percentage amount (e.g. 2%)"
              }`}
              setInput={setIncomeLowerBound}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>

          <div className="input-container">
            <p>Enter the upper bound</p>
            <ValidationTextFields
              value={incomeUpperBound}
              placeholder={`Enter ${
                isFixedIncomeAmount
                  ? "a dollar amount (e.g. $50)"
                  : "a percentage amount (e.g. 2%)"
              }`}
              setInput={setIncomeUpperBound}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default EventSeriesExpectedInput;
