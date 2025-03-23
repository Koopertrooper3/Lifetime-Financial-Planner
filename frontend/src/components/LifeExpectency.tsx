import { useState } from "react";
import "../stylesheets/LifeExpectancy.css";

const LifeExpectancy = (lifeExpectancyType: string) => {
  const [useCustomValues, setUseCustomValues] = useState(false);

  if (lifeExpectancyType === "normal") {
    return (
      <div>
        <p>The data will be pulled from SSA</p>
        {/* Toggle Switch */}
        <div className="toggle-container">
          <p>
            Click the toggle on to enter custom values or off to pull values
            from SSA.
          </p>
          {/* <span>Use custom values:</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={useCustomAge}
              onChange={() => setUseCustomAge(!useCustomAge)}
            />
            <span className="slider"></span>
          </label> */}
        </div>
        <p>Enter the mean age</p>
        <input
          type="text"
          placeholder="Enter the number of years (eg. 82 years old)"
        ></input>
        <p>Enter the standard deviation</p>
        <input
          type="text"
          placeholder="Enter the standard deviation (eg. 8)"
        ></input>
      </div>
    );
  } else {
    return (
      <div>
        <p>Enter Expected Age</p>
        <input
          className="life-expectancy-textbox"
          type="text"
          placeholder="Enter age (eg. 80 years old)"
        ></input>
      </div>
    );
  }
};

export default LifeExpectancy;
