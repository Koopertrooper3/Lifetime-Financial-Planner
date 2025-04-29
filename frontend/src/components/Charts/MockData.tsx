import type { Range } from "./ShadedLineChart";

export const mockSimulationResults = {
    years: [2025, 2026, 2027, 2028],
    successRates: [95, 93, 91, 89],
    medianValues: [50000, 60000, 70000, 80000],
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
  