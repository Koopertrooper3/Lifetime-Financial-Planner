import { useState } from "react";
import AllocationTable from "../shared/AllocationTable";
import AllocationTypeSelector from "../shared/AllocationTypeSelector";
import "../../stylesheets/EventSeries/Invest.css";

type Investment = {
  id: string;
  name: string;
  initialAllocation?: number;
  finalAllocation?: number;
};

interface EventSeriesInvestProps {
  allocationType: "Fixed" | "Glide Path";
  setAllocationType: (type: "Fixed" | "Glide Path") => void;
  investments: Investment[];
  setInvestments: (investments: Investment[]) => void;
  startYear: string;
  setStartYear: (year: string) => void;
  endYear: string;
  setEndYear: (year: string) => void;
  maxCashHoldings: string;
  setMaxCashHoldings: (amount: string) => void;
}

const EventSeriesInvest = ({
  allocationType,
  setAllocationType,
  investments,
  setInvestments,
  startYear,
  setStartYear,
  endYear,
  setEndYear,
  maxCashHoldings,
  setMaxCashHoldings,
}: EventSeriesInvestProps) => {
  return (
    <div className="event-series-invest-container">
      <div className="title-with-info">
        <h3 className="purple-text">Invest</h3>
        <p className="grayed-text">Investments, bonds, estate funds, etc</p>
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
          investments={investments}
          allocationType={allocationType}
        ></AllocationTable>
      </div>

      <div className="max-holdings-container">
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
      </div>
    </div>
  );
};

export default EventSeriesInvest;
