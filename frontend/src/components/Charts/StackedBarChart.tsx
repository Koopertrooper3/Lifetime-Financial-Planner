import React from "react";
import { Bar } from "react-chartjs-2";

export type YearlyInvestmentBreakdown = Record<string, number>;

type StackedBarChartProps = {
  yearlyBreakdown: Record<string, YearlyInvestmentBreakdown> | undefined | null;
  aggregationThreshold?: number;
};

const StackedBarChart: React.FC<StackedBarChartProps> = ({
  yearlyBreakdown,
  aggregationThreshold = 0,
}) => {
  if (!yearlyBreakdown || typeof yearlyBreakdown !== "object") return null;

  const years = Object.keys(yearlyBreakdown)
    .map(Number)
    .filter((y) => !isNaN(y))
    .sort((a, b) => a - b);

  
  const processedBreakdown: Record<string, YearlyInvestmentBreakdown> = {};

  years.forEach((year) => {
    const breakdown = yearlyBreakdown?.[year.toString()] ?? {};
    const newBreakdown: YearlyInvestmentBreakdown = {};
    let otherTotal = 0;

    Object.entries(breakdown).forEach(([name, value]) => {
      if (aggregationThreshold && value < aggregationThreshold) {
        otherTotal += value;
      } else {
        newBreakdown[name] = value;
      }
    });

    if (otherTotal > 0) {
      newBreakdown["Other"] = (newBreakdown["Other"] || 0) + otherTotal;
    }

    processedBreakdown[year.toString()] = newBreakdown;
  });


  const allNames = new Set<string>();
  Object.values(processedBreakdown).forEach((inv) => {
    if (inv && typeof inv === "object") {
      Object.keys(inv).forEach((name) => allNames.add(name));
    }
  });
  const investmentNames = Array.from(allNames);

  
  const datasets = investmentNames.map((name) => ({
    label: name,
    data: years.map(
      (year) => processedBreakdown?.[year.toString()]?.[name] ?? 0
    ),
    backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, ${Math.floor(Math.random() * 255)}, 0.6)`,
    stack: "stack1",
  }));

  const chartData = {
    labels: years,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default StackedBarChart;
