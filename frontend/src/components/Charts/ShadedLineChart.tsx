import React from "react";
import { Line } from "react-chartjs-2";

export type Range = [number, number];

export type YearlyResult = {
  totalInvestments: number[];
};

type ShadedLineChartProps = {
  yearlyResults: Record<string, YearlyResult>;
  ranges: {
    "10-90": Range[];
    "20-80": Range[];
    "30-70": Range[];
    "40-60": Range[];
  };
};

const ShadedLineChart: React.FC<ShadedLineChartProps> = ({ yearlyResults, ranges }) => {
  const years = Object.keys(yearlyResults).map(Number).sort();

  const medianValues = years.map((year) => {
    const values = yearlyResults[year.toString()].totalInvestments;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  });

  const data = {
    labels: years,
    datasets: [
      {
        label: "Median",
        data: medianValues,
        borderColor: "black",
        backgroundColor: "transparent",
        fill: false,
      },
      ...Object.entries(ranges).map(([rangeLabel, rangeValues], idx) => ({
        label: rangeLabel,
        data: rangeValues.map(([low, high]) => (low + high) / 2),
        backgroundColor: `rgba(100, 100, 255, ${(idx + 1) * 0.1})`,
        fill: true,
      })),
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => `Value: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return <Line data={data} options={options} />;
};

export default ShadedLineChart;