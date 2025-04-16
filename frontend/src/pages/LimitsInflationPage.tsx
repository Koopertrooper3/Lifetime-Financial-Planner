import { useState } from "react";
import { Link } from "react-router-dom";
import CenteredFormWrapper from "../wrapper/CenteredFormWrapper";
import ValidationTextFields from "../components/shared/ValidationTextFields";

export function LimitsInflationPage() {
  const [distributionType, setDistributionType] = useState<
    "Fixed Value/Percentage" | "Normal Distribution" | "Uniform Distribution"
  >("Fixed Value/Percentage");
  const [fixedInflationRate, setFixedInflationRate] = useState<string | number>(
    ""
  );
  const [meanInflationRate, setMeanInflationRate] = useState<string | number>();

  const [stdDev, setStdDev] = useState<string | number>("");

  const [upperBoundInflationRate, setUpperBoundInflationRate] = useState<
    string | number
  >("");

  const [lowerBoundInflationRate, setLowerBoundInflationRate] = useState<
    string | number
  >("");

  const [annualContribution, setAnnualContribution] = useState<string | number>(
    ""
  );

  return (
    <CenteredFormWrapper>
      <div className="header-line">
        <h2 className="header green-title">Limits and Inflation</h2>{" "}
        {/* Fixed h2 tag */}
        <span className="grayed-text">Inflation & Contribution Limits</span>
        <span className="red-text">Required</span>
        <Link to="/scenarioFormPage" className="back-link">
          {"<<"}Back
        </Link>
      </div>

      <p className="grayed-text">
        Limits & Inflation represent assumptions that affect your plan's
        long-term projections. These include how quickly costs rise over time
        (inflation) and annual contribution limits et by the IRS.
      </p>

      {/*Different selection types*/}
      <div className="type-container">
        <p>
          Choose how to model future inflation.{" "}
          <span className="grayed-text">
            You can enter a fixed percentage value or a percentage value sampled
            from a normal or uniform distribution.
          </span>
        </p>
        <div>
          <label className="option">
            <input
              type="radio"
              id="distributionType"
              value="Fixed Value/Percentage"
              onChange={() => {
                setDistributionType("Fixed Value/Percentage");
              }}
              checked={distributionType == "Fixed Value/Percentage"}
            ></input>
            Fixed Value/Percentage
          </label>
          <label className="option">
            <input
              type="radio"
              id="distributionType"
              value="Normal Distribution"
              onChange={() => {
                setDistributionType("Normal Distribution");
              }}
              checked={distributionType == "Normal Distribution"}
            ></input>
            Normal Distribution
          </label>
          <label className="option">
            <input
              type="radio"
              id="distributionType"
              value="Uniform Distribution"
              onChange={() => {
                setDistributionType("Uniform Distribution");
              }}
              checked={distributionType == "Uniform Distribution"}
            ></input>
            Uniform Distribution
          </label>
        </div>
      </div>

      {distributionType === "Fixed Value/Percentage" && (
        <div>
          <p>Enter a inflation rate</p>
          <ValidationTextFields
            value={fixedInflationRate}
            placeholder="Enter inflation rate (e.g. 2.5%)"
            setInput={setFixedInflationRate}
            inputType="number"
            width="100%"
            height="1.4375em"
            disabled={false}
          />
        </div>
      )}

      {distributionType === "Normal Distribution" && (
        <div>
          <div>
            <p>Enter a mean inflation rate</p>
            <ValidationTextFields
              value={meanInflationRate}
              placeholder="Enter inflation rate (e.g. 2.5%)"
              setInput={setMeanInflationRate}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>
          <div>
            <p>Enter a standard deviation</p>
            <ValidationTextFields
              placeholder="Enter standard deviation (e.g. 0.2%)"
              setInput={setStdDev}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>
        </div>
      )}

      {distributionType === "Uniform Distribution" && (
        <div>
          <div>
            <p>Enter an upper bound</p>
            <ValidationTextFields
              placeholder="Enter upper bound inflation rate (e.g. 2.5%)"
              setInput={setUpperBoundInflationRate}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>
          <div>
            <p>Enter a lower bound</p>
            <ValidationTextFields
              placeholder="Enter lower bound nflation rate (e.g. 1%)"
              setInput={setLowerBoundInflationRate}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>
        </div>
      )}

      <div>
        <p>
          Enter the current annual contribution limit for after-tax retirement
          accounts.{" "}
          <span className="grayed-text">
            This amount is assumed to increase with inflation over time.
          </span>
        </p>
        <ValidationTextFields
          placeholder="Enter inflation rate (e.g. 2.5%)"
          setInput={setAnnualContribution}
          inputType="number"
          width="100%"
          height="1.4375em"
          disabled={false}
        ></ValidationTextFields>
      </div>
    </CenteredFormWrapper>
  );
}
