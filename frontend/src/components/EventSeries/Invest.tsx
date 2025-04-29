import { useEffect, useState } from "react";
import AllocationTable from "../shared/AllocationTable";
import AllocationTypeSelector from "../shared/AllocationTypeSelector";
import "../../stylesheets/EventSeries/Invest.css";
import {
  Investment,
  assetProportion,
  useScenarioContext,
} from "../../useScenarioContext";

interface EventSeriesInvestProps {
  allocationType: "Fixed" | "Glide Path";
  setAllocationType: (type: "Fixed" | "Glide Path") => void;
  allocatedInvestments: assetProportion[];
  setAllocatedInvestments: (allocated2Investments: assetProportion[]) => void;
  allocated2Investments: assetProportion[];
  setAllocated2Investments: (allocated2Investments: assetProportion[]) => void;
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
  allocatedInvestments,
  setAllocatedInvestments,
  allocated2Investments,
  setAllocated2Investments,
  startYear,
  setStartYear,
  endYear,
  setEndYear,
  maxCashHoldings,
  setMaxCashHoldings,
}: EventSeriesInvestProps) => {
  const { editEventSeries } = useScenarioContext();

  useEffect(() => {
    setMaxCashHoldings(editEventSeries.event.maxCash || 0);
  }, [editEventSeries]);

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
          allocatedInvestments={allocatedInvestments}
          setAllocatedInvestments={setAllocatedInvestments}
          allocated2Investments={allocated2Investments}
          setAllocated2Investments={setAllocated2Investments}
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
