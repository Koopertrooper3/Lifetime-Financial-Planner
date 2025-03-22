import "../stylesheets/AddPlan.css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useState } from "react";
import CreateScenario from "./CreateScenario";

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
        <div className="modal">
          <div className="modal-content">
            <CreateScenario />
          </div>

          {/*Close Button */}
          <button className="close-button" onClick={() => setAddPlan(false)}>
            ✕ Close
          </button>
        </div>
      )}
    </>
  );
};

export default AddPlan;
