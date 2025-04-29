import ToggleSwitch from "./ToggleSwitch";
import "../../stylesheets/shared/IncomeAllocationInput.css";
import { useScenarioContext } from "../../useScenarioContext";
import { useEffect } from "react";

interface IncomeAllocationInputProps {
  applyInflation: boolean;
  setApplyInflation: (apply: boolean) => void;
  userPercentage: number;
  setUserPercentage: (value: number) => void;
  spousePercentage: number;
  setSpousePercentage: (value: number) => void;
}

const IncomeAllocationInput = ({
  applyInflation,
  setApplyInflation,
  userPercentage,
  setUserPercentage,
  spousePercentage,
  setSpousePercentage,
}: IncomeAllocationInputProps) => {
  const { editEventSeries, maritalStatus } = useScenarioContext();

  useEffect(() => {
    setApplyInflation(editEventSeries?.event?.inflationAdjusted || false);
    setUserPercentage(editEventSeries?.event?.userFraction * 100 || 100);
    if (maritalStatus === "couple") {
      setSpousePercentage(editEventSeries?.event?.spouseFraction * 100);
    }
  }, [editEventSeries]);

  return (
    <div className="income-allocation-container">
      {/* Inflation */}
      <div className="inflation-container">
        <div className="inflation-toggle-container">
          <h3 className="purple-title">Inflation adjustment?</h3>
          <ToggleSwitch checked={applyInflation} onChange={setApplyInflation} />
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
              onChange={(e) => setUserPercentage(Number(e.target.value))}
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
              onChange={(e) => setSpousePercentage(Number(e.target.value))}
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
