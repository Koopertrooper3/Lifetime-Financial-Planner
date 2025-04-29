import "../stylesheets/AddPlan.css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useScenarioContext } from "../useScenarioContext";

const AddPlan = () => {
  const [addPlan, setAddPlan] = useState(false);
  const { setEditScenario } = useScenarioContext();
  const navigate = useNavigate();

  const handleClick = () => {
    setEditScenario(null);
    setAddPlan(true);
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
