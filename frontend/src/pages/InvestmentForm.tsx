import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CenteredFormWrapper from "../wrapper/CenteredFormWrapper";
import ExpectedInput from "../components/shared/InvestmentExpectedInput";
import "../stylesheets/AddNewInvestment.css";
import ValidationTextFields from "../components/shared/ValidationTextFields";
import { useScenarioContext } from "../context/useScenarioContext";
import { useInvestmentHooks } from "../hooks/useInvestmentHooks";
import { Investment } from "../../../backend/db/InvestmentSchema";
import { useHelperContext } from "../context/HelperContext";

export default function AddNewInvestmentForm() {
  const navigate = useNavigate();
  const navigateRef = useRef(false);
  const { handleEditScenario } = useHelperContext();
  const { editScenario, setEditScenario, investmentTypes } =
    useScenarioContext();
  const { investmentHooks } = useInvestmentHooks();
  const taxOptions = [
    { label: "Taxable", value: "non-retirement" },
    { label: "Tax-Deferred", value: "pre-tax" },
    { label: "Tax-Free", value: "after-tax" },
  ];

  useEffect(() => {
    if (navigateRef.current) {
      navigateRef.current = false;
      navigate("/dashboard/createScenario");
    }
  }, [editScenario]);

  const handleSaveInvestment = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { investmentType, marketValue, taxStatus } = investmentHooks;

    // NOTE: Have to change ID later.
    const newInvestment: Investment = {
      investmentType: investmentType,
      value: Number(marketValue),
      taxStatus: taxStatus as "non-retirement" | "pre-tax" | "after-tax",
      id: investmentType, // use name as a temporary ID
    };
    // add hook as well
    // ------------------------------------------------

    const userID = await (
      await fetch("http://localhost:8000/user", {
        credentials: "include",
      })
    )
      .json()
      .then((res) => res.user.user_id);

    const scenarioID = editScenario._id;
    const updatedInvestments = {
      ...editScenario.investments,
      [investmentType]: newInvestment,
    };

    const response = await handleEditScenario(userID, scenarioID, {
      investments: updatedInvestments,
    });

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
        <div className="header-line">
          <h2 className="header">Add New Investment</h2>
          <Link to="/dashboard/createScenario" className="back-link">
            {"<<"}Back
          </Link>
        </div>

        {/* Investment Type */}
        <div className="investment-name-container">
          <h3 className="purple-title">Investment Type</h3>
          <select
            className="textbox"
            value={investmentHooks.investmentType}
            onChange={(e) => investmentHooks.setInvestmentType(e.target.value)}
          >
            <option value="">Select an existing investment type</option>
            {Object.keys(investmentTypes).map((typeName) => (
              <option key={typeName} value={typeName}>
                {typeName}
              </option>
            ))}
          </select>
          <Link to="addNewInvestmentType" className="inline-link">
            + Add New Investment Type
          </Link>
        </div>

        {/* Current Market Value */}
        <div className="investment-value-container">
          <h3 className="purple-title">Current Market Value</h3>
          <ValidationTextFields
            value={investmentHooks.marketValue}
            placeholder="$10,000"
            setInput={(val) => investmentHooks.setMarketValue(String(val))}
            inputType="number"
            width="100%"
            height="1.4375em"
            disabled={false}
          />
        </div>

        {/* Tax Status */}
        <div className="taxability-container">
          <h3 className="purple-title">Tax Status</h3>
          {taxOptions.map(({ label, value }) => (
            <label className="option" key={value}>
              <input
                type="radio"
                name="taxStatus"
                value={value}
                checked={investmentHooks.taxStatus === value}
                onChange={() =>
                  investmentHooks.setTaxStatus(
                    value as "non-retirement" | "pre-tax" | "after-tax"
                  )
                }
              />
              {label}
            </label>
          ))}
        </div>

        <div className="save-investment-type-container">
          <button
            className="save-investment-type-button"
            onClick={handleSaveInvestment}
          >
            Save Investment
          </button>
        </div>
      </CenteredFormWrapper>
    </motion.div>
  );
}
