import { useState } from "react";
import "../stylesheets/CreateScenario.css";
import LifeExpectency from "../components/LifeExpectency";

export default function CreateScenarioPage() {
  const [filingStatus, setFilingStatus] = useState("Single");
  const [lifeExpectancyType, setLifeExpectancyType] = useState("Fixed Age");

  return (
    <div className="create-scenario-container">
      {/*Title*/}
      <h2>Create New Scenario</h2>
      {/*Description*/}
      <p className="grayed-text">
        A scenario is a personalized financial plan. It includes investments,
        income, expenses, life events, and retirement strategies
      </p>

      {/*Filing Status*/}
      <div className="filing-status-container">
        <h3>FilingStatus</h3>
        <div>
          <label>
            <input
              type="radio"
              id="filingStatus"
              value="Single"
              onChange={() => setFilingStatus("Single")}
              checked={filingStatus == "Single"}
            ></input>
            Single
          </label>
          <label>
            <input
              type="radio"
              id="filingStatus"
              value="Filing Jointly"
              onChange={() => setFilingStatus("Filing Jointly")}
              checked={filingStatus == "Filing Jointly"}
            ></input>
            Filing Jointly
          </label>
        </div>
      </div>

      {/*Birth Year*/}
      <div className="birth-container">
        <div className="first-birth-textbox">
          <h3>Birth Year</h3>
          <input
            className="textbox"
            type="text"
            placeholder="Enter a year (e.g., 2003)"
          ></input>
        </div>
        <div>
          <h3>Spouse Birth Year</h3>
          <input
            className="textbox"
            type="text"
            placeholder="Enter a year (e.g., 2003)"
            disabled={filingStatus !== "Filing Jointly"}
          ></input>
        </div>
      </div>

      {/*State of Residence*/}
      <div className="residence-container">
        <h3>State of Residence</h3>
        <input
          className="textbox"
          type="text"
          placeholder="Enter a state eg. New York"
        ></input>
      </div>

      <div className="section-container">
        {/*Life Expectancy*/}
        <div className="life-expectancy-container">
          <h3>Life Expectancy (How long you live)</h3>
          <p>
            Choose how to model your life expectancy. You can enter a fixed age
            or use a normal distribution
          </p>
          <div>
            <label>
              <input
                type="radio"
                id="life-expectancy"
                value="Fixed Age"
                onChange={() => setLifeExpectancyType("Fixed Age")}
                checked={lifeExpectancyType == "Fixed Age"}
              ></input>
              Fixed Age
            </label>
            <label>
              <input
                type="radio"
                id="life-expectancy"
                value="Normal Distribution"
                onChange={() => setLifeExpectancyType("Normal Distribution")}
                checked={lifeExpectancyType == "Normal Distribution"}
              ></input>
              Normal Distribution
            </label>

            {LifeExpectency(lifeExpectancyType)}
          </div>
        </div>

        {/*Investment Types*/}
        <div className="investment-type-container">
          <h3>Investment Types</h3>
          <p>
            Expand below to view previously defined investment types or create a
            new one.
          </p>
          {/*not sure how this works yet*/}
          <a href="#">Click here to expand Investment Types settings ▼</a>
        </div>

        {/*Event Series*/}
        <div className="event-series-container">
          <h3>Event Series</h3>
          <p>
            Expand below to view previously defined events or create a new one.
          </p>
          <a href="#">Click here to expand Event Series settings ▼</a>
        </div>
      </div>
    </div>
  );
};
