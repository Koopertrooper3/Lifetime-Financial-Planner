import { Investment } from "../../../../backend/db/InvestmentSchema";
import { assetProportion } from "../../../../backend/db/EventSchema";
import { useScenarioContext } from "../../useScenarioContext";
import "../../stylesheets/shared/AllocationTable.css";
import { useState, useEffect } from "react";

interface AllocationTableProps {
  allocatedInvestments: assetProportion[];
  setAllocatedInvestments: (allocatedInvestments: assetProportion[]) => void;
  allocated2Investments: assetProportion[];
  setAllocated2Investments: (allocated2Investments: assetProportion[]) => void;
  allocationType: "Fixed" | "Glide Path";
}

const AllocationTable = ({
  allocatedInvestments,
  setAllocatedInvestments,
  allocated2Investments,
  setAllocated2Investments,
  allocationType,
}: AllocationTableProps) => {
  const { editEventSeries } = useScenarioContext();

  useEffect(() => {
    setAllocatedInvestments(editEventSeries.event.assetAllocation || []);
    setAllocated2Investments(editEventSeries.event.assetAllocation2 || []);
  }, [editEventSeries]);

  useEffect(() => {
    console.log(`allocatedInvestments`, allocatedInvestments);
  }, [allocatedInvestments]);

  const { investmentTypes } = useScenarioContext();
  console.log("investmentType in table row:", investmentTypes);

  const handleInitialAllocationChange = (
    investmentTypeName: string,
    value: number
  ) => {
    const updated = [...allocatedInvestments];
    const existingIndex = updated.findIndex(
      (inv) => inv.asset === investmentTypeName
    );
    console.log(`existingIndex`, { existingIndex });

    if (existingIndex >= 0) {
      console.log({
        [`updated[${existingIndex}]`]: updated[existingIndex],
      });

      updated[existingIndex] = { ...updated[existingIndex], proportion: value };
    } else {
      updated.push({ asset: investmentTypeName, proportion: value });
    }

    setAllocatedInvestments(updated);
  };

  const handleFinalAllocationChange = (
    investmentTypeName: string,
    value: number
  ) => {
    const updated = [...(allocated2Investments || [])];
    const existingIndex = updated.findIndex(
      (inv) => inv.asset === investmentTypeName
    );

    if (existingIndex >= 0) {
      updated[existingIndex] = { ...updated[existingIndex], proportion: value };
    } else {
      updated.push({ asset: investmentTypeName, proportion: value });
    }

    setAllocated2Investments(updated);
  };

  console.log(`investmentTypes`, investmentTypes);

  return (
    <table className="allocation-table">
      <thead>
        <tr>
          <th>Investment Type</th>
          {allocationType === "Fixed" && <th>Allocation (in %)</th>}
          {allocationType === "Glide Path" && (
            <>
              <th>Initial Allocation (in %)</th>
              <th>Final Allocation (in %)</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {Object.entries(investmentTypes).map(
          ([key, investmentType]: [string, any]) => {
            const initial = allocatedInvestments.find(
              (inv) => inv.asset === investmentType.name
            )?.proportion;

            const final = allocated2Investments?.find(
              (inv) => inv.asset === investmentType.name
            )?.proportion;

            return (
              <tr key={investmentType.name}>
                <td>{investmentType.name}</td>

                {allocationType === "Fixed" ? (
                  <td>
                    <input
                      className="allocation-textbox"
                      type="number"
                      min="0"
                      max="100"
                      value={initial !== undefined ? initial * 100 : ""}
                      placeholder="Enter a % (e.g. 60%)"
                      onChange={(e) => {
                        const newValue = Number(e.target.value) / 100;
                        handleInitialAllocationChange(
                          investmentType.name,
                          newValue
                        );
                      }}
                    />
                  </td>
                ) : (
                  <>
                    <td>
                      <input
                        className="allocation-textbox"
                        type="number"
                        min="0"
                        max="100"
                        value={initial !== undefined ? initial * 100 : ""}
                        placeholder="Enter a % (e.g. 60%)"
                        onChange={(e) => {
                          const newValue = Number(e.target.value) / 100;
                          handleInitialAllocationChange(
                            investmentType.name,
                            newValue
                          );
                        }}
                      />
                    </td>
                    <td>
                      <input
                        className="allocation-textbox"
                        type="number"
                        min="0"
                        max="100"
                        value={final !== undefined ? final * 100 : ""}
                        placeholder="Enter a % (e.g. 60%)"
                        onChange={(e) => {
                          const newValue = Number(e.target.value) / 100;
                          handleFinalAllocationChange(
                            investmentType.name,
                            newValue
                          );
                        }}
                      />
                    </td>
                  </>
                )}
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  );
};

export default AllocationTable;
