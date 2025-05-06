import { useMemo } from "react";

export function useStackedBarChartData(rawData: any, aggregationType: "average" | "median" = "average") {
  return useMemo(() => {
    const breakdown: Record<string, Record<string, number>> = {};

    if (!rawData?.results) return breakdown;

    for (const [year, aggData] of rawData.results.entries()) {
      const yearStr = year.toString();
      const dataBlock = aggData?.[aggregationType]?.investments;

      if (!dataBlock) continue;

      breakdown[yearStr] = {};
      for (const [invType, value] of dataBlock.entries()) {
        breakdown[yearStr][invType] = value;
      }
    }

    return breakdown;
  }, [rawData, aggregationType]);
}
