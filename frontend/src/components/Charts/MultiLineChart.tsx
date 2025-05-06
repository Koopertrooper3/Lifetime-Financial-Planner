// Chart 5.1
import React from "react";
import { Line } from "react-chartjs-2";
import { AnnualResults } from "../../../../backend/simulator/simulatorInterfaces";

type MultiLineChartProps = {
  simulationRecords: Record<number, AnnualResults[]>;
  quantity: keyof AnnualResults;
};

const MultiLineChart: React.FC<MultiLineChartProps> = ({ simulationRecords, quantity }) => {
  const paramValues = Object.keys(simulationRecords).map(Number).sort((a, b) => a - b);
  const years = simulationRecords[paramValues[0]].map((_, idx) => idx);

  const datasets = paramValues.map((val) => ({
    label: `Param ${val}`,
    data: simulationRecords[val].map((result) => result[quantity] as number),
    fill: false,
    borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`
  }));

  return <Line data={{ labels: years, datasets }} />;
};

export default MultiLineChart;
