// Chart 5.2
import React from "react";
import { Line } from "react-chartjs-2";
import { AnnualResults } from "../../../../backend/simulator/simulatorInterfaces";

type LineChartByParamProps = {
  simulationRecords: Record<number, AnnualResults[]>;
  quantity: keyof AnnualResults;
};

const LineChartByParam: React.FC<LineChartByParamProps> = ({ simulationRecords, quantity }) => {
  const paramValues = Object.keys(simulationRecords).map(Number).sort((a, b) => a - b);

  const data = paramValues.map((val) => {
    const final = simulationRecords[val][simulationRecords[val].length - 1];
    return final[quantity] as number;
  });

  return <Line data={{ labels: paramValues, datasets: [{ label: quantity, data }] }} />;
};

export default LineChartByParam;