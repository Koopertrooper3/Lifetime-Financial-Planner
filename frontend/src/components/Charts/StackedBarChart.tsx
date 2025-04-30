import React from "react";
import { Bar } from "react-chartjs-2";

export type YearlyInvestmentBreakdown = Record<string, number>;

type StackedBarChartProps = {
  yearlyBreakdown: Record<string, YearlyInvestmentBreakdown> | undefined | null;
};

const StackedBarChart: React.FC<StackedBarChartProps> = ({ yearlyBreakdown }) => {
  if (!yearlyBreakdown || typeof yearlyBreakdown !== "object") return null;

  const years = Object.keys(yearlyBreakdown)
    .map(Number)
    .filter((y) => !isNaN(y))
    .sort((a, b) => a - b);

  const allNames = new Set<string>();
  Object.values(yearlyBreakdown).forEach((inv) => {
    if (inv && typeof inv === "object") {
      Object.keys(inv).forEach((name) => allNames.add(name));
    }
  });
  const investmentNames = Array.from(allNames);

  const datasets = investmentNames.map((name) => ({
    label: name,
    data: years.map(
      (year) => yearlyBreakdown?.[year.toString()]?.[name] ?? 0
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
