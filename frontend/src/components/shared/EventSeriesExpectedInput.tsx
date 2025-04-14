import ToggleSwitch from "./ToggleSwitch";
import "../../stylesheets/InvestmentType/ExpectedInput.css";

type DistributionType =
  | "Fixed Value/Percentage"
  | "Normal Distribution"
  | "Uniform Distribution";

interface EventSeriesExpectedInputProps {
  distributionType: DistributionType;
  setDistributionType: (type: DistributionType) => void;
  isFixedAmount: boolean;
  setIsFixedAmount: (isAmount: boolean) => void;
  fixedValue?: string;
  setFixedValue?: (value: string) => void;
  mean?: string;
  setMean?: (value: string) => void;
  stdDev?: string;
  setStdDev?: (value: string) => void;
  lowerBound?: string;
  setLowerBound?: (value: string) => void;
  upperBound?: string;
  setUpperBound?: (value: string) => void;
}

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
}: EventSeriesExpectedInputProps) => {
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
        <input
          className="textbox"
          value={fixedValue}
          onChange={(e) => setFixedValue(e.target.value)}
          placeholder={`Enter ${
            isFixedAmount
              ? "a dollar amount (e.g. $50)"
              : "a percentage amount (e.g. 0.4%)"
          }`}
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
            <input
              className="textbox"
              value={mean}
              onChange={(e) => setMean(e.target.value)}
              placeholder={`Enter ${
                isFixedAmount
                  ? "a dollar amount (e.g. $50)"
                  : "a percentage amount (e.g. 2%)"
              }`}
            />
          </div>

          <div className="input-container">
            <p>Enter the standard deviation</p>
            <input
              className="textbox"
              value={stdDev}
              onChange={(e) => setStdDev(e.target.value)}
              placeholder={`Enter ${
                isFixedAmount
                  ? "a dollar amount (e.g. $50)"
                  : "a percentage amount (e.g. 2%)"
              }`}
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
            <input
              className="textbox"
              value={lowerBound}
              onChange={(e) => setLowerBound(e.target.value)}
              placeholder={`Enter ${
                isFixedAmount
                  ? "a dollar amount (e.g. $50)"
                  : "a percentage amount (e.g. 2%)"
              }`}
            />
          </div>

          <div className="input-container">
            <p>Enter the upper bound</p>
            <input
              className="textbox"
              value={upperBound}
              onChange={(e) => setUpperBound(e.target.value)}
              placeholder={`Enter ${
                isFixedAmount
                  ? "a dollar amount (e.g. $50)"
                  : "a percentage amount (e.g. 2%)"
              }`}
            />
          </div>
        </div>
      </div>
    );
  }
};

export default EventSeriesExpectedInput;
