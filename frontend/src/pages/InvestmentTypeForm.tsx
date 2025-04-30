import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ExpectedInput from "../components/shared/InvestmentTypeExpectedInput";
import CenteredFormWrapper from "../wrapper/CenteredFormWrapper";
import "../stylesheets/InvestmentType/AddNewInvestmentType.css";
import ValidationTextFields from "../components/shared/ValidationTextFields";
import { useInvestmentTypeHooks } from "../hooks/useInvestmentTypeHooks";
import { useScenarioContext } from "../useScenarioContext";
import { InvestmentType } from "../../../backend/db/InvestmentTypesSchema";
import {
  FixedDistribution,
  NormalDistribution,
  UniformDistribution,
} from "../../../backend/db/DistributionSchemas";
import { useHelperContext } from "../HelperContext";

type ValueType = "Fixed Amount/Percentage" | "Normal Distribution";
const isValueType = (val: any): val is ValueType =>
  val === "Fixed Amount/Percentage" || val === "Normal Distribution";

export default function InvestmentTypeForm() {
  const navigate = useNavigate();
  const navigateRef = useRef(false);
  const { investmentTypeHooks } = useInvestmentTypeHooks();
  const { editInvestmentType, investmentTypes, editScenario, setEditScenario } =
    useScenarioContext();
  const { handleEditScenario } = useHelperContext();

  useEffect(() => {
    if (navigateRef.current) {
      navigateRef.current = false;
      navigate("/dashboard/createScenario");
    }
  }, [editScenario]);

  useEffect(() => {
    if (editInvestmentType) {
      const {
        setInvestmentTypeName,
        setInvestmentTypeDescription,
        setExpectedRatio,
        setIsTaxable,
        setIsFixedReturnAmount,
        setReturnFixedValue,
        setReturnMean,
        setReturnStdDev,
        setIsFixedIncomeAmount,
        setIncomeFixedValue,
        setIncomeMean,
        setIncomeStdDev,
      } = investmentTypeHooks;

      setInvestmentTypeName(editInvestmentType.name || "");
      setInvestmentTypeDescription(editInvestmentType.description || "");
      setExpectedRatio(
        editInvestmentType.expenseRatio !== null
          ? editInvestmentType.expenseRatio
          : ""
      );
      setIsTaxable(editInvestmentType.taxability ?? true); // fallback to true

      // Return Distribution
      setIsFixedReturnAmount(editInvestmentType.returnAmtOrPct === "amount");
      if (editInvestmentType.returnDistribution.type === "fixed") {
        investmentTypeHooks?.setReturnDistributionType(
          "Fixed Amount/Percentage"
        );
        setReturnFixedValue(editInvestmentType.returnDistribution.value || "");
      } else if (editInvestmentType.returnDistribution.type === "normal") {
        investmentTypeHooks?.setReturnDistributionType("Normal Distribution");
        setReturnMean(editInvestmentType.returnDistribution.mean);
        setReturnStdDev(editInvestmentType.returnDistribution.stdev);
      }

      // Income Distribution
      setIsFixedIncomeAmount(editInvestmentType.incomeAmtOrPct === "amount");
      if (editInvestmentType.incomeDistribution.type === "fixed") {
        investmentTypeHooks?.setIncomeDistributionType(
          "Fixed Amount/Percentage"
        );
        setIncomeFixedValue(editInvestmentType.incomeDistribution.value || "");
      } else if (editInvestmentType.incomeDistribution.type === "normal") {
        investmentTypeHooks?.setIncomeDistributionType("Normal Distribution");
        setIncomeMean(editInvestmentType.incomeDistribution.mean);
        setIncomeStdDev(editInvestmentType.incomeDistribution.stdev);
      }
    }
  }, [editInvestmentType]);

  function mapDistributionType(distributionType: string): "fixed" | "normal" {
    if (distributionType === "Fixed Amount/Percentage") return "fixed";
    if (distributionType === "Normal Distribution") return "normal";
    throw new Error("Invalid distribution type");
  }

  const handleSaveInvestmentType = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!investmentTypeHooks) return;

    const {
      investmentTypeName,
      investmentTypeDescription,
      expectedRatio,
      taxable,
      isFixedReturnAmount,
      returnFixedValue,
      returnMean,
      returnStdDev,
      isFixedIncomeAmount,
      incomeFixedValue,
      incomeMean,
      incomeStdDev,
    } = investmentTypeHooks;

    const returnDistributionTypeMapped = mapDistributionType(
      investmentTypeHooks?.returnDistributionType
    );
    const incomeDistributionTypeMapped = mapDistributionType(
      investmentTypeHooks?.incomeDistributionType
    );

    const returnDistribution:
      | FixedDistribution
      | NormalDistribution
      | UniformDistribution =
      returnDistributionTypeMapped === "fixed"
        ? { type: "fixed", value: Number(returnFixedValue) }
        : {
            type: "normal",
            mean: Number(returnMean),
            stdev: Number(returnStdDev),
          };

    console.log("Return distribution: ", returnDistribution);

    const incomeDistribution:
      | FixedDistribution
      | NormalDistribution
      | UniformDistribution =
      incomeDistributionTypeMapped === "fixed"
        ? { type: "fixed", value: Number(incomeFixedValue) }
        : {
            type: "normal",
            mean: Number(incomeMean),
            stdev: Number(incomeStdDev),
          };

    console.log("income distribution: ", incomeDistribution);

    const newInvestmentType: InvestmentType = {
      name: String(investmentTypeName),
      description: String(investmentTypeDescription),
      returnAmtOrPct: isFixedReturnAmount ? "amount" : "percent",
      returnDistribution: returnDistribution,
      expenseRatio: Number(expectedRatio),
      incomeAmtOrPct: isFixedIncomeAmount ? "amount" : "percent",
      incomeDistribution: incomeDistribution,
      taxability: taxable,
    };

    const updatedInvestmentTypes = { ...investmentTypes };

    // Remove old investment type if the name was changed
    if (
      editInvestmentType &&
      editInvestmentType.name !== newInvestmentType.name
    ) {
      delete updatedInvestmentTypes[editInvestmentType.name];
    }

    // Replace with new investment type
    updatedInvestmentTypes[newInvestmentType.name] = newInvestmentType;

    const userID = await (async () => {
      const res = await fetch("http://localhost:8000/user", {
        credentials: "include", // ensures session cookie is sent
      });
      const user = await res.json();
      return user._id;
    })();
    const scenarioID = editScenario._id;
    const updatedField = {
      investmentTypes: updatedInvestmentTypes,
    };
    const response = await handleEditScenario(userID, scenarioID, updatedField);
    setEditScenario(response.data);
    navigateRef.current = true;
  };

  return (
    <motion.div
      initial={{ x: window.innerWidth }}
      animate={{ x: 0 }}
      exit={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CenteredFormWrapper>
        {/*Title*/}
        <div className="header-line">
          <h2 className="header">{"Add New Investment Type"}</h2>
          <Link to="/dashboard/createScenario" className="back-link">
            {"<<"}Back
          </Link>
        </div>

        {/*Investment Name*/}
        <div className="investment-name-container">
          <h3 className="purple-title">Investment Name</h3>
          {investmentTypeHooks?.setInvestmentTypeName && (
            <ValidationTextFields
              value={investmentTypeHooks?.investmentTypeName ?? ""}
              placeholder="e.g., S&P 500 ETF"
              setInput={investmentTypeHooks?.setInvestmentTypeName}
              inputType="string"
              width="200px"
              height="1.4375em"
              disabled={false}
            ></ValidationTextFields>
          )}
        </div>

        {/*Description*/}
        <div className="investment-type-description-container">
          <h3 className="purple-title">Description</h3>
          {investmentTypeHooks?.setInvestmentTypeDescription && (
            <ValidationTextFields
              value={investmentTypeHooks?.investmentTypeDescription ?? ""}
              placeholder="Describe your investment type, e.g. Tracks the S&P 500 index"
              setInput={investmentTypeHooks?.setInvestmentTypeDescription ?? ""}
              inputType="string"
              width="100%"
              height="150px"
              disabled={false}
            ></ValidationTextFields>
          )}
        </div>

        {/*Expected Annual Return*/}
        <div className="expected-container">
          <div className="title-with-info">
            <h3 className="purple-title">Expected Annual Return</h3>
            <span className="grayed-text">Capital Gains/Losses</span>
          </div>

          {/*Expected Annual Return Description*/}
          <div className="description-container">
            <span className="black-text">
              Choose how to model the expected annual return from this
              investment:{" "}
            </span>
            <span className="grayed-text">
              You can enter a fixed amount/percentage or a value sampled from a
              normal distribution
            </span>
          </div>

          {/*Different selection types*/}
          <div className="type-container">
            <div>
              <label className="option">
                <input
                  type="radio"
                  id="returnType"
                  value="Fixed Amount/Percentage"
                  onChange={() => {
                    investmentTypeHooks?.setReturnDistributionType(
                      "Fixed Amount/Percentage"
                    );
                  }}
                  checked={
                    investmentTypeHooks?.returnDistributionType ==
                    "Fixed Amount/Percentage"
                  }
                ></input>
                Fixed Amount/Percentage
              </label>
              <label className="option">
                <input
                  type="radio"
                  id="returnType"
                  value="Normal Distribution"
                  onChange={() => {
                    investmentTypeHooks?.setReturnDistributionType(
                      "Normal Distribution"
                    );
                  }}
                  checked={
                    investmentTypeHooks?.returnDistributionType ==
                    "Normal Distribution"
                  }
                ></input>
                Normal Distribution
              </label>
            </div>
          </div>

          <ExpectedInput
            inputType="return"
            valueType={
              isValueType(investmentTypeHooks?.returnDistributionType)
                ? investmentTypeHooks?.returnDistributionType
                : undefined
            }
            isFixedAmount={investmentTypeHooks?.isFixedReturnAmount}
            setToggle={investmentTypeHooks?.setIsFixedReturnAmount}
            fixedValue={investmentTypeHooks?.returnFixedValue}
            setFixedValue={investmentTypeHooks?.setReturnFixedValue}
            mean={investmentTypeHooks?.returnMean}
            setMean={investmentTypeHooks?.setReturnMean}
            stdDev={investmentTypeHooks?.returnStdDev}
            setStdDev={investmentTypeHooks?.setReturnStdDev}
          />
        </div>

        <div className="expected-ratio-container">
          <div className="expected-ratio-title-with-info">
            <h3 className="purple-title">Expected Ratio (%) </h3>
            <span className="grayed-text">
              Percentage value of the investment subtracted annually by the
              investment provider
            </span>
          </div>
          <ValidationTextFields
            value={investmentTypeHooks?.expectedRatio ?? ""}
            placeholder="Enter a percentage amount (e.g. 0.4%)"
            setInput={investmentTypeHooks?.setExpectedRatio}
            inputType="number"
            width="100%"
            height="1.4375em"
            disabled={false}
          ></ValidationTextFields>
        </div>

        {/*Expected Annual Income*/}
        <div className="expected-container">
          <div className="title-with-info">
            <h3 className="purple-title">Expected Annual Income</h3>
            <span className="grayed-text">
              Dividends, interest, rental income, etc.
            </span>
          </div>

          {/*Expected Annual Income Description*/}
          <div className="description-container">
            <span className="black-text">
              Choose how to model the expected annual income from this
              investment:{" "}
            </span>
            <span className="grayed-text">
              You can enter a fixed amount/percentage, a value sampled from a
              normal distribution, or use a Markov process with geometric
              Brownian motion (GBM)
            </span>
          </div>

          {/*Different selection types*/}
          <div className="type-container">
            <div>
              <label className="option">
                <input
                  type="radio"
                  id="incomeType"
                  value="Fixed Amount/Percentage"
                  onChange={() =>
                    investmentTypeHooks?.setIncomeDistributionType(
                      "Fixed Amount/Percentage"
                    )
                  }
                  checked={
                    investmentTypeHooks?.incomeDistributionType ==
                    "Fixed Amount/Percentage"
                  }
                ></input>
                Fixed Amount/Percentage
              </label>
              <label className="option">
                <input
                  type="radio"
                  id="incomeType"
                  value="Normal Distribution"
                  onChange={() =>
                    investmentTypeHooks?.setIncomeDistributionType(
                      "Normal Distribution"
                    )
                  }
                  checked={
                    investmentTypeHooks?.incomeDistributionType ==
                    "Normal Distribution"
                  }
                ></input>
                Normal Distribution
              </label>
            </div>
          </div>

          <ExpectedInput
            inputType="income"
            valueType={
              isValueType(investmentTypeHooks?.incomeDistributionType)
                ? investmentTypeHooks?.incomeDistributionType
                : undefined
            }
            isFixedAmount={investmentTypeHooks?.isFixedIncomeAmount}
            setToggle={investmentTypeHooks?.setIsFixedIncomeAmount}
            fixedValue={investmentTypeHooks?.incomeFixedValue}
            setFixedValue={investmentTypeHooks?.setIncomeFixedValue}
            mean={investmentTypeHooks?.incomeMean}
            setMean={investmentTypeHooks?.setIncomeMean}
            stdDev={investmentTypeHooks?.incomeStdDev}
            setStdDev={investmentTypeHooks?.setIncomeStdDev}
          />
        </div>

        {/*Taxability*/}
        <div className="taxability-container">
          <h3 className="purple-title">Taxability</h3>
          <div>
            <label className="option">
              <input
                type="radio"
                id="taxStatus"
                value="Taxable"
                onChange={() => investmentTypeHooks?.setIsTaxable(true)}
                checked={investmentTypeHooks?.taxable == true}
              ></input>
              Taxable
            </label>
            <label className="option">
              <input
                type="radio"
                id="taxStatus"
                value="Tax-Exempt"
                onChange={() => investmentTypeHooks?.setIsTaxable(false)}
                checked={investmentTypeHooks?.taxable == false}
              ></input>
              Tax-Exempt
            </label>
          </div>
        </div>

        <div className="save-investment-type-container">
          <button
            className="save-investment-type-button"
            onClick={handleSaveInvestmentType}
          >
            Save Investment Type
          </button>
        </div>
      </CenteredFormWrapper>
    </motion.div>
  );
}
