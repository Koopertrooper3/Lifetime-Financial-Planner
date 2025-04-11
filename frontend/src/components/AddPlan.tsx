import "../stylesheets/AddPlan.css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useState } from "react";
import { Link } from "react-router";

const AddPlan = () => {
  const [addPlan, setAddPlan] = useState(false);

  return (
    <>
      {!addPlan && (
        <div className="add-plan-container">
          <button className="add-plan-button" onClick={() => setAddPlan(true)}>
            <AddCircleOutlineIcon></AddCircleOutlineIcon>
            Create a New Scenario
          </button>
        </div>
      )}

      {addPlan && (
        <div className="popup-overlay">
          <div className="popup-box">
            <Link to="/createScenario">CREATE SCENARIO</Link>
            {/*Close Button */}
            <button className="close-button" onClick={() => setAddPlan(false)}>
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPlan;
