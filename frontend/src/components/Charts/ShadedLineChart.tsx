import React from "react";
import { Line } from "react-chartjs-2";


export type Range = [number, number];

type ShadedLineChartProps = {
  years: number[];
  medianValues: number[];
  ranges: {
    "10-90": Range[];
    "20-80": Range[];
    "30-70": Range[];
    "40-60": Range[];
  };
};

const ShadedLineChart: React.FC<ShadedLineChartProps> = ({ years, medianValues, ranges }) => {
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
