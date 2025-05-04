import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import CenteredFormWrapper from "../wrapper/CenteredFormWrapper";
import ValidationTextFields from "../components/shared/ValidationTextFields";
import "../stylesheets/LimitsInflationPage.css";
import {
  FixedDistribution,
  NormalDistribution,
  UniformDistribution,
} from "../../../backend/db/DistributionSchemas";
import { useScenarioContext } from "../context/useScenarioContext";
import { useInflationAssumptionHooks } from "../hooks/useInflationAssumptionFormHooks";
import { useHelperContext } from "../context/HelperContext";

export function LimitsInflationPage() {
  const navigate = useNavigate();

  const {
    inflationAssumption,
    setInflationAssumption,
    afterTaxContributionLimit,
    setAfterTaxContributionLimit,
    editScenario,
    setEditScenario,
  } = useScenarioContext();
  const { inflationAssumptionHooks } = useInflationAssumptionHooks();
  const { handleEditScenario } = useHelperContext();

  useEffect(() => {
    console.log("Updated inflation assumption", { inflationAssumption });
  }, [inflationAssumption]);

  useEffect(() => {
    const {
      setInflationDistributionType,
      setFixedInflationValue,
      setMean,
      setStdDev,
      setLowerBound,
      setUpperBound,
      setAnnualContribution,
    } = inflationAssumptionHooks;

    // Set the distribution type and corresponding values
    switch (inflationAssumption.type) {
      case "fixed":
        setInflationDistributionType("Fixed Value/Percentage");
        setFixedInflationValue(inflationAssumption.value);
        break;

      case "normal":
        setInflationDistributionType("Normal Distribution");
        setMean(inflationAssumption.mean);
        setStdDev(inflationAssumption.stdev);
        break;

      case "uniform":
        setInflationDistributionType("Uniform Distribution");
        setLowerBound(inflationAssumption.lower);
        setUpperBound(inflationAssumption.upper);
        break;
    }

    setAnnualContribution(afterTaxContributionLimit);
  }, [inflationAssumption]);

  function mapDistributionType(
    distributionType: string
  ): "Fixed" | "Normal" | "Uniform" {
    if (distributionType === "Fixed Value/Percentage") return "Fixed";
    if (distributionType === "Normal Distribution") return "Normal";
    if (distributionType === "Uniform Distribution") return "Uniform";
    throw new Error("Invalid distribution type");
  }

  const handleSave = async () => {
    const {
      inflationDistributionType,
      fixedInflationValue,
      mean,
      stdDev,
      lowerBound,
      upperBound,
      annualContribution,
    } = inflationAssumptionHooks;

    const distributionTypeMapped = mapDistributionType(
      inflationDistributionType
    );

    let inflationDistribution:
      | FixedDistribution
      | NormalDistribution
      | UniformDistribution;

    switch (distributionTypeMapped) {
      case "Fixed":
        inflationDistribution = {
          type: "fixed",
          value: Number(fixedInflationValue),
        };
        break;
      case "Normal":
        inflationDistribution = {
          type: "normal",
          mean: Number(mean),
          stdev: Number(stdDev),
        };
        break;
      case "Uniform":
        inflationDistribution = {
          type: "uniform",
          lower: Number(lowerBound),
          upper: Number(upperBound),
        };
        break;
    }

    const userID = await (async () => {
      const res = await fetch("http://localhost:8000/user", {
        credentials: "include", // ensures session cookie is sent
      });
      const user = await res.json();
      return user._id;
    })();
    const scenarioID = editScenario._id;
    const updatedFields = {
      inflationAssumption: inflationDistribution,
      afterTaxContributionLimit: Number(annualContribution),
    };

    const response = await handleEditScenario(
      userID,
      scenarioID,
      updatedFields
    );
    setEditScenario(response.data);

    navigate("/dashboard/createScenario");
  };

  return (
    <CenteredFormWrapper>
      <div className="header-line">
        <h2 className="header green-title">Limits and Inflation</h2>{" "}
        <span className="grayed-text">Inflation & Contribution Limits</span>
        <span className="red-text">Required</span>
        <Link to="/dashboard/createScenario" className="back-link">
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
                inflationAssumptionHooks.setInflationDistributionType(
                  "Fixed Value/Percentage"
                );
              }}
              checked={
                inflationAssumptionHooks.inflationDistributionType ==
                "Fixed Value/Percentage"
              }
            ></input>
            Fixed Value/Percentage
          </label>
          <label className="option">
            <input
              type="radio"
              id="distributionType"
              value="Normal Distribution"
              onChange={() => {
                inflationAssumptionHooks.setInflationDistributionType(
                  "Normal Distribution"
                );
              }}
              checked={
                inflationAssumptionHooks.inflationDistributionType ==
                "Normal Distribution"
              }
            ></input>
            Normal Distribution
          </label>
          <label className="option">
            <input
              type="radio"
              id="distributionType"
              value="Uniform Distribution"
              onChange={() => {
                inflationAssumptionHooks.setInflationDistributionType(
                  "Uniform Distribution"
                );
              }}
              checked={
                inflationAssumptionHooks.inflationDistributionType ==
                "Uniform Distribution"
              }
            ></input>
            Uniform Distribution
          </label>
        </div>
      </div>

      {inflationAssumptionHooks.inflationDistributionType ===
        "Fixed Value/Percentage" && (
        <div>
          <p>Enter a inflation rate</p>
          <ValidationTextFields
            value={inflationAssumptionHooks.fixedInflationValue}
            placeholder="Enter inflation rate (e.g. 2.5%)"
            setInput={inflationAssumptionHooks.setFixedInflationValue}
            inputType="number"
            width="100%"
            height="1.4375em"
            disabled={false}
          />
        </div>
      )}

      {inflationAssumptionHooks.inflationDistributionType ===
        "Normal Distribution" && (
        <div>
          <div>
            <p>Enter a mean inflation rate</p>
            <ValidationTextFields
              value={inflationAssumptionHooks.mean}
              placeholder="Enter inflation rate (e.g. 2.5%)"
              setInput={inflationAssumptionHooks.setMean}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>
          <div>
            <p>Enter a standard deviation</p>
            <ValidationTextFields
              value={inflationAssumptionHooks.stdDev}
              placeholder="Enter standard deviation (e.g. 0.2%)"
              setInput={inflationAssumptionHooks.setStdDev}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>
        </div>
      )}

      {inflationAssumptionHooks.inflationDistributionType ===
        "Uniform Distribution" && (
        <div>
          <div>
            <p>Enter an upper bound</p>
            <ValidationTextFields
              value={inflationAssumptionHooks.upperBound}
              placeholder="Enter upper bound inflation rate (e.g. 2.5%)"
              setInput={inflationAssumptionHooks.setUpperBound}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>
          <div>
            <p>Enter a lower bound</p>
            <ValidationTextFields
              value={inflationAssumptionHooks.lowerBound}
              placeholder="Enter lower bound nflation rate (e.g. 1%)"
              setInput={inflationAssumptionHooks.setLowerBound}
              inputType="number"
              width="100%"
              height="1.4375em"
              disabled={false}
            />
          </div>
        </div>
      )}

      <div className="contribution-container">
        <p>
          Enter the current annual contribution limit for after-tax retirement
          accounts.{" "}
          <span className="grayed-text">
            This amount is assumed to increase with inflation over time.
          </span>
        </p>
        <ValidationTextFields
          value={inflationAssumptionHooks.annualContribution}
          placeholder="Enter inflation rate (e.g. 2.5%)"
          setInput={inflationAssumptionHooks.setAnnualContribution}
          inputType="number"
          width="100%"
          height="1.4375em"
          disabled={false}
        ></ValidationTextFields>
      </div>

      <div>
        <button className="save-button" onClick={handleSave}>
          Save
        </button>
      </div>
    </CenteredFormWrapper>
  );
}
