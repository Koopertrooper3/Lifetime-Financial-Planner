type Investment = {
  id: string;
  name: string;
  initialAllocation?: number;
  finalAllocation?: number;
};

interface AllocationTableProps {
  investments: Investment[];
  allocationType: "Fixed" | "Glide Path";
}

const AllocationTable = ({
  investments,
  allocationType,
}: AllocationTableProps) => {
  return (
    <table className="allocation-table">
      <thead>
        <tr>
          <th>Investment Type</th>
          {allocationType === "Fixed" && (
            <>
              <th>Initial Allocation (in %)</th>
              <th>Final Allocation (in %)</th>
            </>
          )}
          {allocationType === "Glide Path" && (
            <>
              <th>Allocation (in %)</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {investments.map((investment) => (
          <tr key={investment.id}>
            <td>{investment.name}</td>
            {allocationType === "Fixed" ? (
              <>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={investment.initialAllocation ?? ""}
                    placeholder="Enter a % (eg. 60%)"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={investment.finalAllocation ?? ""}
                    placeholder="Enter a % (eg. 60%)"
                  />
                </td>
              </>
            ) : (
              <td>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={investment.initialAllocation ?? ""}
                  placeholder="Enter a % (eg. 60%)"
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AllocationTable;
