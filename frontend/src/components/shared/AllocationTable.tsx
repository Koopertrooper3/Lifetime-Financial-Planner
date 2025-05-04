import { Investment } from "../../../../backend/db/InvestmentSchema";
import { assetProportion } from "../../../../backend/db/EventSchema";
import { useScenarioContext } from "../../context/useScenarioContext";
import "../../stylesheets/shared/AllocationTable.css";
import { useState, useEffect } from "react";
import ValidationTextFields from "./ValidationTextFields";

interface AllocationTableProps {
  allocatedInvestments: Record<string, number>;
  setAllocatedInvestments: (
    value:
      | Record<string, number>
      | ((prev: Record<string, number>) => Record<string, number>)
  ) => void;
  allocated2Investments: Record<string, number>; // For glide path
  setAllocated2Investments: (
    value:
      | Record<string, number>
      | ((prev: Record<string, number>) => Record<string, number>)
  ) => void;
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
    setAllocatedInvestments(editEventSeries?.event?.assetAllocation || {});
    setAllocated2Investments(editEventSeries?.event?.assetAllocation2 || {});
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
    setAllocatedInvestments((prevAllocations) => ({
      ...prevAllocations, // Copy existing properties
      [investmentTypeName]: value, // Update/add the specific property
    }));
  };

  const handleFinalAllocationChange = (
    investmentTypeName: string,
    value: number
  ) => {
    setAllocated2Investments((prevAllocations) => ({
      ...prevAllocations, // Copy existing properties
      [investmentTypeName]: value, // Update/add the specific property
    }));
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
            const initial = allocatedInvestments?.[investmentType.name];

            const final = allocated2Investments?.[investmentType.name];

            return (
              <tr key={investmentType.name}>
                <td>{investmentType.name}</td>

                {allocationType === "Fixed" ? (
                  <td>
                    <ValidationTextFields
                      value={initial !== undefined ? initial * 100 : ""}
                      placeholder="Enter a % (e.g. 60)"
                      setInput={(value) => {
                        const numValue = value === "" ? 0 : Number(value) / 100;
                        handleInitialAllocationChange(
                          investmentType.name,
                          numValue
                        );
                      }}
                      inputType="number"
                      width="100px"
                      height="40px"
                      disabled={false}
                    />
                  </td>
                ) : (
                  <>
                    <td>
                      <ValidationTextFields
                        value={initial !== undefined ? initial * 100 : ""}
                        placeholder="Enter a % (e.g. 60)"
                        setInput={(value) => {
                          const numValue =
                            value === "" ? 0 : Number(value) / 100;
                          handleInitialAllocationChange(
                            investmentType.name,
                            numValue
                          );
                        }}
                        inputType="number"
                        width="100px"
                        height="40px"
                        disabled={false}
                      />
                    </td>
                    <td>
                      <ValidationTextFields
                        value={final !== undefined ? final * 100 : ""}
                        placeholder="Enter a % (e.g. 60)"
                        setInput={(value) => {
                          const numValue =
                            value === "" ? 0 : Number(value) / 100;
                          handleFinalAllocationChange(
                            investmentType.name,
                            numValue
                          );
                        }}
                        inputType="number"
                        width="100px"
                        height="40px"
                        disabled={false}
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
