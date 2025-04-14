import "../stylesheets/AddPlan.css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddPlan = () => {
  const [addPlan, setAddPlan] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setAddPlan(true); 
    navigate("/createScenario");
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
