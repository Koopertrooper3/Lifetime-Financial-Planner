import ToggleSwitch from "./shared/ToggleSwitch";
import React, { useState } from "react";
import CollapsibleWrapper from "../wrapper/CollapsibleWrapper";
import MarkovForm from "./MarkovForm";
import "../stylesheets/MarkovProcess.css";

export default function MarkovProcess() {
  const [isFixed, setIsFixed] = useState(false);
  const [clicked, setIsClicked] = useState(false);

  const handleToggleSwitch = (newValue: boolean) => {
    setIsFixed(newValue);
  };

  return (
    <div>
      <div className="title-with-info">
        <h3 className="green-title">Markov process (GBM)</h3>
        <p className="grayed-text">
          {" "}
          (Optional) Stochastic model simulating investment growth
        </p>
      </div>

      <p className="markov-description">
        Using Fixed Amount or Normal Distribution for{" "}
        <span className="purple-text">Annual Return</span> and{" "}
        <span className="purple-text">Annual Income</span>
        <p className="green-text">No action required</p>
      </p>

      <div className="collapsible-container">
        <span>Using GBM?</span>
        <CollapsibleWrapper description="Click here to expand GBM settings">
          <MarkovForm></MarkovForm>
        </CollapsibleWrapper>
      </div>
    </div>
  );
}
