import ToggleSwitch from "./ToggleSwitch";
import "../../stylesheets/InvestmentType/ExpectedInput.css";
import { ExpectedInputProps } from "../../interfaces/InvestmentType/ExpectedInput";
import ValidationTextFields from "./ValidationTextFields";

const ExpectedInput = ({
  inputType,
  valueType,
  isFixedAmount,
  setToggle,
  fixedValue,
  setFixedValue,
  mean = "",
  setMean = () => {},
  stdDev = "",
  setStdDev = () => {},
}: ExpectedInputProps) => {
  const labels = {
    return: {
      description: "Enter the Annual Return",
      descriptionND:
        "To model a normal distribution, enter a mean return and standard deviation.",
      meanLabel: "mean return",
    },
    income: {
      description: "Enter the Annual Income",
      descriptionND:
        "To model a normal distribution, enter a mean income and standard deviation.",
      meanLabel: "mean income",
    },
  };

  const handleToggleSwitch = () => {
    setToggle?.(!isFixedAmount);
  };

  if (valueType == "Fixed Amount/Percentage") {
    return (
      <div className="expected-input-container">
        <p>{inputType && labels[inputType].description}</p>
        <div className="toggle-container">
          <div className="grayed-text">
            Click the toggle <span className="green-word">on</span> to enter the
            {inputType} as a fixed amount (e.g. $50) and{" "}
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
        {/* <input
          className="textbox"
          value={fixedValue}
          onChange={(e) => onFixedValueChange(e.target.value)}
          placeholder={`Enter ${
            isFixedAmount
              ? "a dollar amount (e.g. $50)"
              : "a percentage amount (e.g. 0.4%)"
          }`}
        /> */}
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

  if (valueType == "Normal Distribution") {
    return (
      <div className="expected-input-container">
        <p>{inputType && labels[inputType].descriptionND}</p>
        <div className="toggle-container">
          <p className="grayed-text">
            Click the toggle <span className="green-word">on</span> to enter the
            {inputType && labels[inputType].meanLabel} and standard deviation as a fixed
            amount (eg. $50) and <span className="black-word">off</span> to
            enter as a percentage (e.g. 2%){" "}
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
            <p className="textbox-title">
              Enter the {inputType && labels[inputType].meanLabel}
            </p>
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

  return null;
};

export default ExpectedInput;
