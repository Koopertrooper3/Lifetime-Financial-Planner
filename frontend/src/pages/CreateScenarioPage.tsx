import { useState } from "react";
import "../stylesheets/CreateScenario.css";
import LifeExpectency from "../components/LifeExpectency";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";


// import { Outlet } from "react-router-dom";

export default function CreateScenarioPage() {
  const [filingStatus, setFilingStatus] = useState("Single");
  const [lifeExpectancyType, setLifeExpectancyType] = useState("Fixed Age");

  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      exit={{ x: -window.innerWidth }}
      transition={{ duration: 0.3 }}
      className="create-scenario-container" // moved this class here instead of inner div
    >
      {/*Title*/}
      <div className="header-line">
        <h2 className="header">Create New Scenario</h2>
        <Link to="/dashboard" className="back-link">
          {"<<"}Back
        </Link>
      </div>

      {/*Description*/}
      <p className="scenario-description">
        A scenario is a personalized financial plan. It includes investments,
        income, expenses, life events, and retirement strategies
      </p>

      {/*Filing Status*/}
      <div className="filing-status-container">
        <h3 className="purple-title">Filing Status</h3>
        <div>
          <label>
            <input
              className="status-option"
              type="radio"
              id="filingStatus"
              value="Single"
              onChange={() => setFilingStatus("Single")}
              checked={filingStatus === "Single"}
            />
            Single
          </label>
          <label>
            <input
              className="status-option"
              type="radio"
              id="filingStatus"
              value="Filing Jointly"
              onChange={() => setFilingStatus("Filing Jointly")}
              checked={filingStatus === "Filing Jointly"}
            />
            Filing Jointly
          </label>
        </div>
      </div>

      {/*Birth Year*/}
      <div className="birth-container">
        <div className="first-birth-textbox">
          <h3 className="purple-title">Birth Year</h3>
          <input
            className="textbox"
            type="text"
            placeholder="Enter a year (e.g., 2003)"
          />
        </div>
        <div>
          <h3 className="purple-title">Spouse Birth Year</h3>
          <input
            className="textbox"
            type="text"
            placeholder="Enter a year (e.g., 2003)"
            disabled={filingStatus !== "Filing Jointly"}
          />
        </div>
      </div>

      {/*State of Residence*/}
      <div className="residence-container">
        <h3 className="purple-title">State of Residence</h3>
        <input
          className="textbox"
          type="text"
          placeholder="Enter a state eg. New York"
        />
      </div>

      <div className="section-container">
        {/*Life Expectancy*/}
        <div className="life-expectancy-container">
          <div className="title-with-info">
            <h3 className="purple-title">Life Expectancy</h3>
            <span className="grayed-text">How long you live</span>
          </div>
          <div>
            <span>Choose how to model your life expectancy. </span>
            <span className="grayed-text">
              You can enter a fixed age or use a normal distribution
            </span>
          </div>
          <div>
            <label>
              <input
                type="radio"
                id="life-expectancy"
                value="Fixed Age"
                onChange={() => setLifeExpectancyType("Fixed Age")}
                checked={lifeExpectancyType === "Fixed Age"}
              />
              Fixed Age
            </label>
            <label>
              <input
                type="radio"
                id="life-expectancy"
                value="Normal Distribution"
                onChange={() =>
                  setLifeExpectancyType("Normal Distribution")
                }
                checked={lifeExpectancyType === "Normal Distribution"}
              />
              Normal Distribution
            </label>

            {/* Note: Ensure LifeExpectency is a valid function/component */}
            {LifeExpectency(lifeExpectancyType)}
          </div>
        </div>

        {/*Investment Types*/}
        <div className="investment-type-container">
          <div className="title-with-info">
            <h3 className="green-title">Investment Types</h3>
            <span className="red-text">Required</span>
          </div>
          <p>
            Expand below to view previously defined investment types or create a
            new one.
          </p>
          <Link to="addNewInvestmentType">
            Click here to expand Investment Types settings ▼
          </Link>
        </div>

        {/*Event Series*/}
        <div className="event-series-container">
          <div className="title-with-info">
            <h3 className="green-title">Event Series</h3>
            <span className="red-text">Required</span>
          </div>
          <p>
            Expand below to view previously defined events or create a new one.
          </p>
          <Link to="addNewEventSeries">
            Click here to expand Event Series settings ▼
          </Link>
        </div>

        {/*Inflation & Contribution Limits*/}
        <div className="inflation-container">
          <div className="title-with-info">
            <h3 className="green-title">Inflation & Contribution Limits</h3>
            <span className="red-text">Required</span>
          </div>
          <p>
            Expand below to adjust inflation assumptions and annual contribution
            limits for retirement accounts.
          </p>
          <a href="#">
            Click here to expand Inflation & Contribution Limits settings ▼
          </a>
        </div>

        {/*Spending & Withdrawal*/}
        <div className="spending-withdrawal-container">
          <div className="title-with-info">
            <h3 className="green-title">Spending & Withdrawal</h3>
            <span className="red-text">Required</span>
          </div>
          <p>
            Expand below to view and customize how income is spent, withdrawals
            are handled, and retirement distributions are managed.
          </p>
          <a href="#">
            Click here to expand Spending & Withdrawal settings ▼
          </a>
        </div>

        {/*Sharing Settings*/}
        <div className="sharing-container">
          <div className="title-with-info">
            <h3 className="red-title">Sharing Setings</h3>
            <span className="grayed-text">Optional</span>
          </div>
          <p>Expand below to manage who can access or edit this scenario.</p>
          <a href="#">Click here to expand Sharing settings ▼</a>
        </div>
      </div>
    </motion.div>
  );
}  
