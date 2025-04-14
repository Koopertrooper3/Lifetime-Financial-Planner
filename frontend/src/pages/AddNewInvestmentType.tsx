import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ExpectedInput from "../components/shared/InvestmentTypeExpectedInput";
import CenteredFormWrapper from "../wrapper/CenteredFormWrapper";
import "../stylesheets/InvestmentType/AddNewInvestmentType.css";

export default function AddNewInvestmentType() {
  const [investmentName, setInvestmentName] = useState("");
  const [investmentDescription, setInvestmentDescription] = useState("");

  // Type definitions for distribution options
  type ValueType = "Fixed Amount/Percentage" | "Normal Distribution";

  // returnType and incomeType are used to differentiate between fixed amount/percentage and normal distribution
  const [returnType, setReturnType] = useState<ValueType>(
    "Fixed Amount/Percentage"
  );
  const [incomeType, setIncomeType] = useState<ValueType>(
    "Fixed Amount/Percentage"
  );

  const [taxable, setIsTaxable] = useState(true);

  // useStates for expected annual return
  // isFixedReturnAmount is used to differentiate between whether the value is in percentage or dollar
  const [isFixedReturnAmount, setIsFixedReturnAmount] = useState(true);
  const [returnFixedValue, setReturnFixedValue] = useState("");
  const [returnMean, setReturnMean] = useState("");
  const [returnStdDev, setReturnStdDev] = useState("");

  // useStates for expected annual income
  const [isFixedIncomeAmount, setIsFixedIncomeAmount] = useState(true);
  const [incomeFixedValue, setIncomeFixedValue] = useState("");
  const [incomeMean, setIncomeMean] = useState("");
  const [incomeStdDev, setIncomeStdDev] = useState("");

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
          <h2 className="header">Add New Investment Type</h2>
          <Link to="/dashboard/createScenario" className="back-link">
            {"<<"}Back
          </Link>
        </div>
  
        {/*Investment Name*/}
        <div className="investment-name-container">
          <h3 className="purple-title">Investment Name</h3>
          <input
            className="textbox investment-name-textbox"
            type="text"
            onChange={(e) => setInvestmentName(e.target.value)}
            placeholder="e.g., S&P 500 ETF"
          />
        </div>
  
        {/*Description*/}
        <div className="investment-type-description-container">
          <h3 className="purple-title">Description</h3>
          <textarea
            className="textbox investment-description-textbox"
            onChange={(e) => setInvestmentDescription(e.target.value)}
            placeholder="Describe your investment type, e.g. Tracks the S&P 500 index"
          />
        </div>
  
        {/*Expected Annual Return*/}
        <div className="expected-container">
          <div className="title-with-info">
            <h3 className="purple-title">Expected Annual Return</h3>
            <span className="grayed-text">Capital Gains/Losses</span>
          </div>
  
          <div className="description-container">
            <span className="black-text">
              Choose how to model the expected annual return from this investment:{" "}
            </span>
            <span className="grayed-text">
              You can enter a fixed amount/percentage or a value sampled from a
              normal distribution
            </span>
          </div>
  
          <div className="type-container">
            <div>
              <label className="option">
                <input
                  type="radio"
                  id="returnType"
                  value="Fixed Amount/Percentage"
                  onChange={() => {
                    setReturnType("Fixed Amount/Percentage");
                  }}
                  checked={returnType === "Fixed Amount/Percentage"}
                />
                Fixed Amount/Percentage
              </label>
              <label className="option">
                <input
                  type="radio"
                  id="returnType"
                  value="Normal Distribution"
                  onChange={() => {
                    setReturnType("Normal Distribution");
                  }}
                  checked={returnType === "Normal Distribution"}
                />
                Normal Distribution
              </label>
            </div>
          </div>
  
          <ExpectedInput
            inputType="return"
            valueType={returnType}
            isFixedAmount={isFixedReturnAmount}
            onToggleFixedAmount={setIsFixedReturnAmount}
            fixedValue={returnFixedValue}
            onFixedValueChange={setReturnFixedValue}
            mean={returnMean}
            onMeanChange={setReturnMean}
            stdDev={returnStdDev}
            onStdDevChange={setReturnStdDev}
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
          <input
            className="textbox"
            placeholder="Enter a percentage amount (e.g. 0.4%)"
          />
        </div>
  
        {/*Expected Annual Income*/}
        <div className="expected-container">
          <div className="title-with-info">
            <h3 className="purple-title">Expected Annual Income</h3>
            <span className="grayed-text">
              Dividends, interest, rental income, etc.
            </span>
          </div>
  
          <div className="description-container">
            <span className="black-text">
              Choose how to model the expected annual income from this investment:{" "}
            </span>
            <span className="grayed-text">
              You can enter a fixed amount/percentage, a value sampled from a
              normal distribution, or use a Markov process with geometric Brownian
              motion (GBM)
            </span>
          </div>
  
          <div className="type-container">
            <div>
              <label className="option">
                <input
                  type="radio"
                  id="incomeType"
                  value="Fixed Amount/Percentage"
                  onChange={() => setIncomeType("Fixed Amount/Percentage")}
                  checked={incomeType === "Fixed Amount/Percentage"}
                />
                Fixed Amount/Percentage
              </label>
              <label className="option">
                <input
                  type="radio"
                  id="incomeType"
                  value="Normal Distribution"
                  onChange={() => setIncomeType("Normal Distribution")}
                  checked={incomeType === "Normal Distribution"}
                />
                Normal Distribution
              </label>
            </div>
          </div>
  
          <ExpectedInput
            inputType="income"
            valueType={incomeType}
            isFixedAmount={isFixedIncomeAmount}
            onToggleFixedAmount={setIsFixedIncomeAmount}
            fixedValue={incomeFixedValue}
            onFixedValueChange={setIncomeFixedValue}
            mean={incomeMean}
            onMeanChange={setIncomeMean}
            stdDev={incomeStdDev}
            onStdDevChange={setIncomeStdDev}
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
                onChange={() => setIsTaxable(true)}
                checked={taxable === true}
              />
              Taxable
            </label>
            <label className="option">
              <input
                type="radio"
                id="taxStatus"
                value="Tax-Exempt"
                onChange={() => setIsTaxable(false)}
                checked={taxable === false}
              />
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
