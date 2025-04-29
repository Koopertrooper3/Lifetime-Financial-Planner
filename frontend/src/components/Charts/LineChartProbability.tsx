import React from "react";
import { Line } from "react-chartjs-2";

type LineChartProbabilityProps = {
  years: number[];
  successRates: number[];
};

const LineChartProbability: React.FC<LineChartProbabilityProps> = ({ years, successRates }) => {
  const data = {
    labels: years,
    datasets: [
      {
        label: "Probability of Success (%)",
        data: successRates,
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
