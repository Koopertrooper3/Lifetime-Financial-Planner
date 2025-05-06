import { useMemo } from "react";
import { Range } from "../components/Charts/ShadedLineChart";

export function useProbabilityRangeChartData(rawData: any, asset = "totalInvestments") {
  return useMemo(() => {
    const yearlyResults: Record<string, { totalInvestments: number[] }> = {};
    const ranges: Record<string, Range[]> = {
      "10-90": [],
      "20-80": [],
      "30-70": [],
      "40-60": [],
    };

    if (!rawData?.results) return { yearlyResults, ranges };

    for (const [year, assetMap] of rawData.results.entries()) {
      const assetData = assetMap.get(asset);
      if (!assetData) continue;

      yearlyResults[year] = { totalInvestments: [assetData.median] }; // Just using median here, adjust if needed

      for (const key of Object.keys(ranges)) {
        const range = assetData.ranges?.[key];
        if (range?.length === 2) {
          ranges[key].push(range);
        }
      }
    }

    return { yearlyResults, ranges };
  }, [rawData, asset]);
}
