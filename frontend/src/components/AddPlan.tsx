import "../stylesheets/AddPlan.css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useScenarioContext } from "../useScenarioContext";
import { Scenario } from "../../../backend/db/Scenario";
import { useHelperContext } from "../HelperContext";
import axios from "axios";

const AddPlan = () => {
  const {
    name,
    maritalStatus,
    birthYears,
    lifeExpectancy,
    financialGoal,
    residenceState,
    investmentTypes,
    investments,
    eventSeries,
    inflationAssumption,
    afterTaxContributionLimit,
    spendingStrategy,
    expenseWithdrawalStrategy,
    RMDStrategy,
    RothConversionOpt,
    RothConversionStart,
    RothConversionEnd,
    RothConversionStrategy,
    editScenario,
    setEditScenario,
  } = useScenarioContext();

  useEffect(() => {
    console.log("Current lifeExpectancy:", lifeExpectancy);
  }, [lifeExpectancy]);

  const { allScenarios, fetchAllScenarios } = useHelperContext();

  const navigate = useNavigate();

  const getId = async () => {
    // grabs user info
    const userInfo = await axios.get("http://localhost:8000/user", {
      withCredentials: true,
    });
    return userInfo.data.googleId;
  };

  const handleSaveScenario = async (userID: string, scenario: Scenario) => {
    try {
      const res = await axios.post("http://localhost:8000/scenario/create", {
        userID,
        scenario,
      });

      console.log("Scenario created successfully:", res.data);
      // You can redirect or show success UI here
    } catch (error) {
      console.error("Error saving scenario:", error);
      // Optionally show an error message to the user
    }
  };

  const handleClick = async () => {
    const currentUserId = await getId();
    console.log("Raw lifeExpectancy:", lifeExpectancy);

    const scenario = {
      name: name,
      maritalStatus: maritalStatus,
      birthYears: birthYears,
      lifeExpectancy: lifeExpectancy,
      financialGoal: financialGoal,
      residenceState: residenceState,
      investmentTypes: investmentTypes,
      investments: investments,
      eventSeries: eventSeries,
      inflationAssumption: inflationAssumption,
      afterTaxContributionLimit: afterTaxContributionLimit,
      spendingStrategy: spendingStrategy,
      expenseWithdrawalStrategy: expenseWithdrawalStrategy,
      RMDStrategy: RMDStrategy,
      RothConversionOpt: RothConversionOpt,
      RothConversionStart: RothConversionStart,
      RothConversionEnd: RothConversionEnd,
      RothConversionStrategy: RothConversionStrategy,
    };
    console.log("Add Plan: investmentType: ", investmentTypes);
    console.log("Add Plan: currentUserID: ", currentUserId);
    console.log("Add Plan: scenario: ", scenario);
    await handleSaveScenario(currentUserId, scenario);
    await fetchAllScenarios();
    const latestScenario = allScenarios?.[allScenarios.length - 1];
    setEditScenario(latestScenario);

    navigate("/dashboard/createScenario");
  };

  return (
    <div className="add-plan-container">
      <button className="add-plan-button" onClick={handleClick}>
        <AddCircleOutlineIcon />
        Create a New Scenario
      </button>
    </div>
  );
};

export default AddPlan;
