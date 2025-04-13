interface AllocationTypeSelectorProps {
  allocationType: "Fixed" | "Glide Path";
  setAllocationType: (type: "Fixed" | "Glide Path") => void;
}

const AllocationTypeSelector = ({
  allocationType,
  setAllocationType,
}: AllocationTypeSelectorProps) => {
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
