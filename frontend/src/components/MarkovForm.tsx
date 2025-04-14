import ToggleSwitch from "./shared/ToggleSwitch";
import React, { useState } from "react";

export default function MarkovFunction() {
  const [isFixed, setIsFixed] = useState(false);
  const handleToggleSwitch = (newValue: boolean) => {
    setIsFixed(newValue);
  };

  return (
    <div>
      <p>
        This model simulates investment growth over time, accounting for
        randomness while following an expected trend.
      </p>

      <div className="input-container">
        <p>Enter the Initial Investment Value</p>
        <p>
          Click the toggle <span className="green-text">on</span> to enter the
          value as a fixed amount (eg. $50) and{" "}
          <span className="black-text">off</span> to enter as a percentage (eg.
          2%){" "}
          <span>
            <ToggleSwitch
              checked={isFixed}
              onChange={handleToggleSwitch}
            ></ToggleSwitch>
          </span>
        </p>
        <input
          type="number"
          placeholder={`Enter ${
            isFixed
              ? "a dollar amount (e.g. $50)"
              : "a percentage amount (e.g. 2%)"
          }`}
        ></input>

        <div>
          <p>
            Enter the Drift Rate{" "}
            <span className="grayed-text">
              The expected long-term annual return. A higher drift rate means
              higher projected growth.
            </span>
          </p>
          <input
            type="number"
            placeholder={`Enter ${
              isFixed
                ? "a dollar amount (e.g. $50)"
                : "a percentage amount (e.g. 2%)"
            }`}
          ></input>
        </div>

        <div>
          <p>
            Enter the Volatility{" "}
            <span className="grayed-text">
              Measures fluctuations in returns. Higher volatility means larger,
              unpredicatable price swings.
            </span>
          </p>
          <input
            type="number"
            placeholder={`Enter ${
              isFixed
                ? "a dollar amount (e.g. $50)"
                : "a percentage amount (e.g. 2%)"
            }`}
          ></input>
        </div>

        <div>
          <p>Enter the Time Horizon (duration)</p>
          <input
            type="number"
            placeholder="Enter the number of year(s) (eg. 10)"
          ></input>
        </div>
      </div>
    </div>
  );
}
