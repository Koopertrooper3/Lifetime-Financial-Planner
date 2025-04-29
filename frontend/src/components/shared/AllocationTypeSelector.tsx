import { useEffect } from "react";
import { useScenarioContext } from "../../useScenarioContext";

interface AllocationTypeSelectorProps {
  allocationType: "Fixed" | "Glide Path";
  setAllocationType: (type: "Fixed" | "Glide Path") => void;
}

const AllocationTypeSelector = ({
  allocationType,
  setAllocationType,
}: AllocationTypeSelectorProps) => {
  const { editEventSeries } = useScenarioContext();
  
  useEffect(() => {
    setAllocationType(
      editEventSeries.event.glidePath ? "Glide Path" : "Fixed"
    );
  }, [editEventSeries])

  return (
    <div className="allocation-type-selector-container">
      <label className="option">
        <input
          type="radio"
          id="allocationType"
          value="Fixed"
          onChange={() => {
            setAllocationType("Fixed");
          }}
          checked={allocationType == "Fixed"}
        ></input>
        Fixed
      </label>
      <label className="option">
        <input
          type="radio"
          id="allocationType"
          value="Glide Path"
          onChange={() => {
            setAllocationType("Glide Path");
          }}
          checked={allocationType == "Glide Path"}
        ></input>
        Glide Path
      </label>
    </div>
  );
};

export default AllocationTypeSelector;
