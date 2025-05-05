import ToggleSwitch from "./ToggleSwitch";
import "../../stylesheets/InvestmentType/ExpectedInput.css";
import ValidationTextFields from "./ValidationTextFields";

type DistributionType = "Fixed Value/Percentage" | "Normal Distribution" | "Uniform Distribution";

interface SimulationExpectedInputProps {
  distributionType: DistributionType;
  setDistributionType: (type: DistributionType) => void;
  isFixedAmount: boolean;
  setIsFixedAmount: (val: boolean) => void;
  fixedValue: string;
  setFixedValue: (val: string) => void;
  mean: string;
  setMean: (val: string) => void;
  stdDev: string;
  setStdDev: (val: string) => void;
  lowerBound: string;
  setLowerBound: (val: string) => void;
  upperBound: string;
  setUpperBound: (val: string) => void;
}

const SimulationExpectedInput: React.FC<SimulationExpectedInputProps> = ({
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
}) => {
  const handleToggleSwitch = () => {
    setIsFixedAmount(!isFixedAmount);
  };

  if (distributionType === "Fixed Value/Percentage") {
    return (
      <div className="expected-input-container">
        <p>Define the fixed change in your simulation parameter.</p>
        <div className="toggle-container">
          <p className="grayed-text">
            <span className="purple-text">$ or %?</span> Click the toggle <span className="green-word">on</span> to input a dollar amount (e.g. $50), or <span className="black-word">off</span> to input a percentage (e.g. 2%).
            <ToggleSwitch checked={isFixedAmount} onChange={handleToggleSwitch} />
          </p>
        </div>
        <ValidationTextFields
          value={fixedValue}
          placeholder={`Enter ${isFixedAmount ? "a dollar amount (e.g. 1000)" : "a percentage (e.g. 5%)"}`}
          setInput={setFixedValue}
          inputType="number"
          width="100%"
          height="1.4375em"
          disabled={false}
        />
      </div>
    );
  }

  if (distributionType === "Normal Distribution") {
    return (
      <div className="expected-input-container">
        <p>Define a normal distribution for the parameter to simulate variability with a mean and standard deviation.</p>
        <div className="toggle-container">
          <p className="grayed-text">
            <span className="purple-text">$ or %?</span> Toggle <span className="green-word">on</span> for dollar values, or <span className="black-word">off</span> for percentages.
            <ToggleSwitch checked={isFixedAmount} onChange={handleToggleSwitch} />
          </p>
        </div>
        <div className="input-container">
          <p className="textbox-title">Mean</p>
          <ValidationTextFields
            value={mean}
            placeholder={`Enter ${isFixedAmount ? "$ value (e.g. 1000)" : "% value (e.g. 5%)"}`}
            setInput={setMean}
            inputType="number"
            width="100%"
            height="1.4375em"
            disabled={false}
          />
        </div>
        <div className="input-container">
          <p className="textbox-title">Standard Deviation</p>
          <ValidationTextFields
            value={stdDev}
            placeholder={`Enter ${isFixedAmount ? "$ deviation (e.g. 100)" : "% deviation (e.g. 1.5%)"}`}
            setInput={setStdDev}
            inputType="number"
            width="100%"
            height="1.4375em"
            disabled={false}
          />
        </div>
      </div>
    );
  }

  if (distributionType === "Uniform Distribution") {
    return (
      <div className="expected-input-container">
        <p>Specify a range to simulate a uniform distribution for this parameter.</p>
        <div className="toggle-container">
          <p className="grayed-text">
            <span className="purple-text">$ or %?</span> Toggle <span className="green-word">on</span> for fixed dollar amounts, or <span className="black-word">off</span> for percentage ranges.
            <ToggleSwitch checked={isFixedAmount} onChange={handleToggleSwitch} />
          </p>
        </div>
        <div className="input-container">
          <p className="textbox-title">Lower Bound</p>
          <ValidationTextFields
            value={lowerBound}
            placeholder={`Enter ${isFixedAmount ? "minimum $ value (e.g. 500)" : "minimum % (e.g. 1%)"}`}
            setInput={setLowerBound}
            inputType="number"
            width="100%"
            height="1.4375em"
            disabled={false}
          />
        </div>
        <div className="input-container">
          <p className="textbox-title">Upper Bound</p>
          <ValidationTextFields
            value={upperBound}
            placeholder={`Enter ${isFixedAmount ? "maximum $ value (e.g. 1500)" : "maximum % (e.g. 6%)"}`}
            setInput={setUpperBound}
            inputType="number"
            width="100%"
            height="1.4375em"
            disabled={false}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default SimulationExpectedInput;
