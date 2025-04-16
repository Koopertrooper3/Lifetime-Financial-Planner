import ToggleSwitch from "./ToggleSwitch";
import "../../stylesheets/InvestmentType/ExpectedInput.css";
import ValidationTextFields from "./ValidationTextFields";
import { ExpectedInput } from "../../interfaces/EventSeries/ExpectedInput";

const EventSeriesExpectedInput = ({
  distributionType,
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
