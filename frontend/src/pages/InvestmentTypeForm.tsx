import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ExpectedInput from "../components/shared/InvestmentTypeExpectedInput";
import CenteredFormWrapper from "../wrapper/CenteredFormWrapper";
import "../stylesheets/InvestmentType/AddNewInvestmentType.css";
import ValidationTextFields from "../components/shared/ValidationTextFields";
import { useHelperContext } from "../HelperContext";

type ValueType = "Fixed Amount/Percentage" | "Normal Distribution";
const isValueType = (val: any): val is ValueType =>
  val === "Fixed Amount/Percentage" || val === "Normal Distribution";

interface InvestmentTypeFormProps {
  isEditMode?: boolean;
  investmentType?: any;
}

export default function InvestmentTypeForm({
  isEditMode,
  investmentType,
}: InvestmentTypeFormProps) {
  const { fetchDistribution, investmentTypeHooks } = useHelperContext();
  const [returnDist, setReturnDist] = useState<any>(null);
  const [incomeDist, setIncomeDist] = useState<any>(null);

  useEffect(() => {
    const fetchDistributions = async () => {
      try {
        const returnData = await fetchDistribution(
          investmentType?.returnDistribution
        );
        const incomeData = await fetchDistribution(
          investmentType?.incomeDistribution
        );
        setReturnDist(returnData);
        setIncomeDist(incomeData);
      } catch (error) {
        console.error("Error fetching distributions:", error);
      }
    };

    if (
      investmentType?.returnDistribution &&
      investmentType?.incomeDistribution
    ) {
      fetchDistributions();
    }
  }, [investmentType, fetchDistribution]);

  useEffect(() => {
    if (!investmentType) return;

    investmentTypeHooks?.setInvestmentTypeName(investmentType.name ?? "");
    investmentTypeHooks?.setInvestmentTypeDescription(
      investmentType.description ?? ""
    );
    investmentTypeHooks?.setExpectedRatio(investmentType.expenseRatio ?? "");

    investmentTypeHooks?.setIsFixedReturnAmount(
      investmentType.returnAmtOrPct === "amount"
    );
    investmentTypeHooks?.setIsFixedIncomeAmount(
      investmentType.incomeAmtOrPct === "amount"
    );

    investmentTypeHooks?.setIsTaxable(investmentType.taxability ?? true);

    investmentTypeHooks?.setReturnDistributionType(
      returnDist?.type === "fixed"
        ? "Fixed Amount/Percentage"
        : "Normal Distribution"
    );
    investmentTypeHooks?.setReturnFixedValue(returnDist?.value ?? "");
    investmentTypeHooks?.setReturnMean(returnDist?.mean ?? "");
    investmentTypeHooks?.setReturnStdDev(returnDist?.stdev ?? "");

    investmentTypeHooks?.setIncomeDistributionType(
      incomeDist?.type === "fixed"
        ? "Fixed Amount/Percentage"
        : "Normal Distribution"
    );
    investmentTypeHooks?.setIncomeFixedValue(incomeDist?.value ?? "");
    investmentTypeHooks?.setIncomeMean(incomeDist?.mean ?? "");
    investmentTypeHooks?.setIncomeStdDev(incomeDist?.stdev ?? "");
  }, [returnDist, incomeDist]);

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
          <h2 className="header">
            {!isEditMode ? "Add New Investment Type" : "Update Investment Type"}
          </h2>
          <Link to="/scenarioFormPage" className="back-link">
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
          <button className="save-investment-type-button">
            Save Investment Type
          </button>
        </div>
      </CenteredFormWrapper>
    </motion.div>
  );
}
