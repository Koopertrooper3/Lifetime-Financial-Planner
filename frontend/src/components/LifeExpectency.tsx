import { useState } from "react";
import ValidationTextFields from "./shared/ValidationTextFields";
import "../stylesheets/LifeExpectancy.css";

interface LifeExpectancyProps {
  lifeExpectancyType: string;
  expectedAge: string | number;
  setExpectedAge: (value: string | number) => void;
  meanAge: string | number;
  setMeanAge: (value: string | number) => void;
  std: string | number;
  setStd: (value: string | number) => void;
}

const LifeExpectancy = ({
  lifeExpectancyType,
  expectedAge,
  setExpectedAge,
  meanAge,
  setMeanAge,
  std,
  setStd,
}: LifeExpectancyProps) => {
  if (lifeExpectancyType === "Normal Distribution") {
    return (
      <div>
        <p>The data will be pulled from SSA.</p>
        {/* Toggle Switch */}
        <div className="toggle-container">
          <p className="grayed-text">
            Click the toggle <span className="green-word">on</span> to enter
            custom values or <span className="black-word">off</span> to pull
            values from SSA.
          </p>
        </div>
        <p>Enter the mean age</p>
        <ValidationTextFields
          value={meanAge}
          placeholder="Enter number of years (eg. 82)"
          setInput={setMeanAge}
          inputType="number"
          width="230px"
          height="1.4375em"
          disabled={false}
        />
        <p>Enter the standard deviation</p>
        <ValidationTextFields
          value={std}
          placeholder="Enter number of years (eg. 8)"
          setInput={setStd}
          inputType="number"
          width="230px"
          height="1.4375em"
          disabled={false}
        />
      </div>
    );
  } else {
    return (
      <div>
        <p>Enter Expected Age</p>
        <ValidationTextFields
          value={expectedAge}
          placeholder="Enter age (eg. 80 years old)"
          setInput={setExpectedAge}
          inputType="number"
          width="210px"
          height="1.4375em"
          disabled={false}
        />
      </div>
    );
  }
};

export default LifeExpectancy;
