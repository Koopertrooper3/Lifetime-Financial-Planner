import React from "react";
import { Bar } from "react-chartjs-2";

type Investment = {
  name: string;
  value: number;
};

type StackedBarChartProps = {
  data: {
    year: number;
    investments: Investment[];
  }[];
};

const StackedBarChart: React.FC<StackedBarChartProps> = ({ data }) => {
  const labels = data.map((item) => item.year);

  const investmentNames = Array.from(
    new Set(data.flatMap((item) => item.investments.map((inv) => inv.name)))
  );

  const datasets = investmentNames.map((name) => ({
    label: name,
    data: data.map((yearData) => {
      const investment = yearData.investments.find((inv) => inv.name === name);
      return investment ? investment.value : 0;
    }),
    backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, ${Math.floor(Math.random() * 255)}, 0.6)`, // Random colors for now
    stack: "stack1",
  }));

  const chartData = {
    labels,
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
