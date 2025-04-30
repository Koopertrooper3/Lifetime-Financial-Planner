import ToggleSwitch from "./ToggleSwitch";
import "../../stylesheets/InvestmentType/ExpectedInput.css";
import ValidationTextFields from "./ValidationTextFields";
import { ExpectedInput } from "../../interfaces/EventSeries/ExpectedInput";
import { useEffect } from "react";
import { useScenarioContext } from "../../useScenarioContext";

const EventSeriesExpectedInput = ({
  distributionType,
  setDistributionType,
  isFixedAmount,
  setIsFixedAmount,
  fixedValue = "",
  setFixedValue = () => {},
  mean = "",
  setMean = () => {},
  stdDev = "",
  setStdDev = () => {},
  lowerBound = "",
  setLowerBound = () => {},
  upperBound = "",
  setUpperBound = () => {},
}: ExpectedInput) => {
  const { editEventSeries } = useScenarioContext();

  useEffect(() => {
    if (editEventSeries) {
      const mapDistributionTypeToLabel = (type: string) => {
        if (type === "normal") return "Normal Distribution";
        if (type === "fixed") return "Fixed Value";
        if (type === "uniform") return "Uniform Distribution";
      };

      setDistributionType(
        mapDistributionTypeToLabel(
          editEventSeries?.event?.changeDistribution?.type
        ) as
          | "Fixed Value/Percentage"
          | "Normal Distribution"
          | "Uniform Distribution"
      );
      setIsFixedAmount(
        editEventSeries?.event.changeAmountOrPercent?.type === "amount"
      );
      setFixedValue(editEventSeries?.event?.changeDistribution?.value || "");
      setMean(editEventSeries?.event?.changeDistribution?.mean || "");
      setStdDev(editEventSeries?.event?.changeDistribution?.stdev || "");
      setLowerBound(editEventSeries?.event?.changeDistribution?.min || "");
      setUpperBound(editEventSeries?.event?.changeDistribution?.max || "");
    }
  }, [editEventSeries]);

  const handleToggleSwitch = () => {
    setIsFixedAmount(!isFixedAmount);
  };

  if (distributionType === "Fixed Value/Percentage") {
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
                checked={isFixedAmount}
                onChange={handleToggleSwitch}
              />
            </span>
          </div>
        </div>
        <ValidationTextFields
          value={fixedValue}
          placeholder={`Enter ${
            isFixedAmount
              ? "a dollar amount (e.g. $50)"
              : "a percentage amount (e.g. 0.4%)"
          }`}
          setInput={setFixedValue}
          inputType="number"
          width="100%"
          height="1.4375em"
          disabled={false}
        />
      </div>
    );
  }

  if (distributionType == "Normal Distribution") {
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
                checked={isFixedAmount}
                onChange={handleToggleSwitch}
              />
            </span>
          </p>
        </div>
        <div>
          <div className="input-container">
            <p className="textbox-title">Enter the mean</p>
            <ValidationTextFields
              value={mean}
              placeholder={`Enter ${
                isFixedAmount
                  ? "a dollar amount (e.g. $50)"
                  : "a percentage amount (e.g. 2%)"
              }`}
              setInput={setMean}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>

          <div className="input-container">
            <p>Enter the standard deviation</p>
            <ValidationTextFields
              value={stdDev}
              placeholder={`Enter ${
                isFixedAmount
                  ? "a dollar amount (e.g. $50)"
                  : "a percentage amount (e.g. 2%)"
              }`}
              setInput={setStdDev}
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

  if (distributionType == "Uniform Distribution") {
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
                checked={isFixedAmount}
                onChange={handleToggleSwitch}
              />
            </span>
          </p>
        </div>
        <div>
          <div className="input-container">
            <p className="textbox-title">Enter the lower bound</p>
            <ValidationTextFields
              value={lowerBound}
              placeholder={`Enter ${
                isFixedAmount
                  ? "a dollar amount (e.g. $50)"
                  : "a percentage amount (e.g. 2%)"
              }`}
              setInput={setLowerBound}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>

          <div className="input-container">
            <p>Enter the upper bound</p>
            <ValidationTextFields
              value={upperBound}
              placeholder={`Enter ${
                isFixedAmount
                  ? "a dollar amount (e.g. $50)"
                  : "a percentage amount (e.g. 2%)"
              }`}
              setInput={setUpperBound}
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
};

export default EventSeriesExpectedInput;
