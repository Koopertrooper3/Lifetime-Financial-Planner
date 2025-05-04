import { useState } from "react";
import AllocationTable from "../shared/AllocationTable";
import AllocationTypeSelector from "../shared/AllocationTypeSelector";
import "../../stylesheets/EventSeries/Rebalance.css";
import { Investment } from "../../../../backend/db/InvestmentSchema";
import { assetProportion } from "../../../../backend/db/EventSchema";

interface EventSeriesRebalanceProps {
  allocationType: "Fixed" | "Glide Path";
  setAllocationType: (type: "Fixed" | "Glide Path") => void;
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
  startYear: string;
  setStartYear: (year: string) => void;
  endYear: string;
  setEndYear: (year: string) => void;
  maxCashHoldings: string;
  setMaxCashHoldings: (amount: string) => void;
  taxStatus: "pre-tax" | "after-tax" | "non-retirement";
  setTaxStatus: (type: "pre-tax" | "after-tax" | "non-retirement") => void;
}

const EventSeriesRebalance = ({
  allocationType,
  setAllocationType,
  allocatedInvestments,
  setAllocatedInvestments,
  allocated2Investments,
  setAllocated2Investments,
  startYear,
  setStartYear,
  endYear,
  setEndYear,
  taxStatus,
  setTaxStatus,
}: EventSeriesRebalanceProps) => {
  return (
    <div className="event-series-rebalance-container">
      <div className="title-with-info">
        <h3 className="purple-text">Rebalance</h3>
        <p className="grayed-text">
          Rebalance investments, bonds, estate funds, etc.
        </p>
      </div>

      <div className="type-container">
        <label className="option">
          <input
            type="radio"
            name="taxStatus"
            value="Pre-Tax"
            onChange={() => setTaxStatus("pre-tax")}
            checked={taxStatus === "pre-tax"}
          />
          Pre-Tax
        </label>
        <label className="option">
          <input
            type="radio"
            name="taxStatus"
            value="After-Tax"
            onChange={() => setTaxStatus("after-tax")}
            checked={taxStatus === "after-tax"}
          />
          After-Tax
        </label>
        <label className="option">
          <input
            type="radio"
            name="taxStatus"
            value="Non-Retirement"
            onChange={() => setTaxStatus("non-retirement")}
            checked={taxStatus === "non-retirement"}
          />
          Non-Retirement
        </label>
      </div>

      <p>Asset Allocation Type</p>

      <AllocationTypeSelector
        allocationType={allocationType}
        setAllocationType={setAllocationType}
      ></AllocationTypeSelector>

      {allocationType === "Glide Path" && (
        <div className="year-container">
          <p>Enter a fixed set of percentages for the selected investments</p>
          <div>
            <label>Start Year</label>
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              placeholder="Enter a year, eg. 2024"
            ></input>
          </div>
          <div>
            <label>End Year</label>
            <input
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
              placeholder="Enter a year, eg. 2024"
            ></input>
          </div>
        </div>
      )}

      <div className="table-container">
        <AllocationTable
          allocatedInvestments={allocatedInvestments}
          setAllocatedInvestments={setAllocatedInvestments}
          allocated2Investments={allocated2Investments}
          setAllocated2Investments={setAllocated2Investments}
          allocationType={allocationType}
        ></AllocationTable>
      </div>

      {/* <div className="max-holdings-container">
        <p>Maximum Cash Holdings</p>
        <p className="grayed-text">
          Enter the maximum cash balance to maintain. Extra cash will be
          distributed across your selected investments based on the fixed or
          glide path allocation.
        </p>
        <input
          type="number"
          value={maxCashHoldings}
          onChange={(e) => setMaxCashHoldings(e.target.value)}
          placeholder="Enter a dollar amount (eg. $50)"
        ></input>
      </div> */}
    </div>
  );
};

export default EventSeriesRebalance;
