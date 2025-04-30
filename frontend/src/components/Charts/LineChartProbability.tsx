import React from "react";
import { Line } from "react-chartjs-2";

type SuccessEntry = {
  year: number;
  successRate: number; // 0.0 - 1.0
};

type LineChartProbabilityProps = {
  probabilities: SuccessEntry[];
};

const LineChartProbability: React.FC<LineChartProbabilityProps> = ({ probabilities }) => {
  const data = {
    labels: probabilities.map((p) => p.year),
    datasets: [
      {
        label: "Probability of Success (%)",
        data: probabilities.map((p) => p.successRate * 100),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.1)",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y}% success`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return <Line data={data} options={options} />;
};

export default LineChartProbability;