import type { Range } from "./ShadedLineChart";

export const mockSimulationResults = {
  successProbabilities: [
    { year: 2025, successRate: 0.95 },
    { year: 2026, successRate: 0.93 },
    { year: 2027, successRate: 0.91 },
    { year: 2028, successRate: 0.89 },
  ],
  yearlyResults: {
    "2025": {
      totalInvestments: [40000, 50000, 60000],
      totalIncome: [10000, 12000],
      totalExpenses: [5000, 5500],
      earlyWithdrawalTax: [200, 300],
      percentDiscretionaryExpense: [0.6, 0.8],
    },
    "2026": {
      totalInvestments: [50000, 60000, 70000],
      totalIncome: [11000, 13000],
      totalExpenses: [5200, 5600],
      earlyWithdrawalTax: [250, 320],
      percentDiscretionaryExpense: [0.7, 0.85],
    },
    "2027": {
      totalInvestments: [60000, 70000, 80000],
      totalIncome: [12000, 13500],
      totalExpenses: [5300, 5700],
      earlyWithdrawalTax: [260, 340],
      percentDiscretionaryExpense: [0.75, 0.9],
    },
    "2028": {
      totalInvestments: [70000, 80000, 90000],
      totalIncome: [12500, 14000],
      totalExpenses: [5400, 5800],
      earlyWithdrawalTax: [270, 350],
      percentDiscretionaryExpense: [0.8, 0.95],
    },
  },
  ranges: {
    "10-90": [
      [40000, 60000],
      [50000, 70000],
      [60000, 80000],
      [70000, 90000],
    ],
    "20-80": [
      [42000, 58000],
      [52000, 68000],
      [62000, 78000],
      [72000, 88000],
    ],
    "30-70": [
      [44000, 56000],
      [54000, 66000],
      [64000, 76000],
      [74000, 86000],
    ],
    "40-60": [
      [46000, 54000],
      [56000, 64000],
      [66000, 74000],
      [76000, 84000],
    ],
  } as {
    "10-90": Range[];
    "20-80": Range[];
    "30-70": Range[];
    "40-60": Range[];
  },
  stackedBarData: [
    {
      year: 2025,
      investments: [
        { name: "401k", value: 30000 },
        { name: "Roth IRA", value: 20000 },
      ],
    },
    {
      year: 2026,
      investments: [
        { name: "401k", value: 35000 },
        { name: "Roth IRA", value: 25000 },
      ],
    },
    {
      year: 2027,
      investments: [
        { name: "401k", value: 40000 },
        { name: "Roth IRA", value: 30000 },
      ],
    },
    {
      year: 2028,
      investments: [
        { name: "401k", value: 45000 },
        { name: "Roth IRA", value: 35000 },
      ],
    },
  ],
};

  