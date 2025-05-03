import "../stylesheets/AddPlan.css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useScenarioContext } from "../useScenarioContext";
import { Scenario } from "../../../backend/db/Scenario";
import { useHelperContext } from "../HelperContext";
import axiosCookie from "../axiosCookie";

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

  const { fetchScenario } = useHelperContext();

  useEffect(() => {
    setEditScenario(null);
  }, []);

  useEffect(() => {
    console.log("Current lifeExpectancy:", lifeExpectancy);
  }, [lifeExpectancy]);

  const navigate = useNavigate();

  const getId = async () => {
    // grabs user info
    const userInfo = await axiosCookie.get("/user")
    return userInfo.data._id;
  };

  const handleSaveScenario = async (userID: string, scenario: Scenario) => {
    try {
      const res = await axiosCookie.post("/scenario/create", {
        userID,
        scenario,
      });

      console.log("Scenario created successfully:", res.data);
      return res.data;
      // You can redirect or show success UI here
    } catch (error) {
      console.error("Error saving scenario:", error);
      // Optionally show an error message to the user
    }
  };

  const handleClick = async () => {
    const currentUserId = await getId();

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
    const latestScenarioData = await handleSaveScenario(
      currentUserId,
      scenario
    );
    console.log("Add Plan: latestScenarioData", latestScenarioData);
    console.log("latestScenarioData.scenarioID", latestScenarioData.scenarioID);
    const latestScenario = await fetchScenario(latestScenarioData.scenarioID);
    console.log("Add Plan: latestScenario: ", latestScenario);
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
