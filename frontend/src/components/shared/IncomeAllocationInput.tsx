import ToggleSwitch from "./ToggleSwitch";
import "../../stylesheets/shared/IncomeAllocationInput.css";

interface IncomeAllocationInputProps {
  applyInflation: boolean;
  onToggleInflation: (apply: boolean) => void;
  userPercentage: number;
  onUserPercentageChange: (value: number) => void;
  spousePercentage: number;
  onSpousePercentageChange: (value: number) => void;
}

const IncomeAllocationInput = ({
  applyInflation,
  onToggleInflation,
  userPercentage,
  onUserPercentageChange,
  spousePercentage,
  onSpousePercentageChange,
}: IncomeAllocationInputProps) => {
  return (
    <div className="income-allocation-container">
      {/* Inflation */}
      <div className="inflation-container">
        <div className="inflation-toggle-container">
          <h3 className="purple-title">Inflation adjustment?</h3>
          <ToggleSwitch checked={applyInflation} onChange={onToggleInflation} />
        </div>
        <div className="grayed-text">
          Click the toggle <span className="green-word">on</span> to apply
          inflation adjustment (the change will increase at the inflation rate
          in addition to your entered value), and{" "}
          <span className="black-word">off</span> to apply only the explicitly
          specified change (e.g., $50 or 2%).
        </div>
      </div>

      {/* Income Allocation */}
      <div className="allocation-container">
        <p>
          Who receives this income?{" "}
          <span className="grayed-text">
            {" "}
            Specify how this income is split. In individual scenarios, it's
            fully assigned to the user. This affects simulation results.
          </span>
        </p>

        <div className="percentage-container">
          <div className="user-input">
            <div className="purple-title">User</div>
            <input
              className="user-percentage-textbox"
              type="number"
              min="0"
              max="100"
              value={userPercentage}
              onChange={(e) => onUserPercentageChange(Number(e.target.value))}
              placeholder="e.g., 100%"
            />
          </div>
          <div className="spouse-input">
            <div className="purple-title">Spouse</div>
            <input
              className="spouse-percentage-textbox"
              type="number"
              min="0"
              max="100"
              value={spousePercentage}
              onChange={(e) => onSpousePercentageChange(Number(e.target.value))}
              placeholder="e.g., 0%"
            />
          </div>
        </div>

        <p className="red-text">Total must add up to 100%</p>
      </div>
    </div>
  );
};

export default IncomeAllocationInput;
