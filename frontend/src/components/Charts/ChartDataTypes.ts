export interface SuccessProbability {
  year: number;
  successRate: number;
}

export interface ChartData {
  probabilityRange: {
    yearlyResults: Record<string, {
      median: number;
      ranges: {
        "10-90": [number, number];
        "20-80": [number, number];
        "30-70": [number, number];
        "40-60": [number, number];
      };
    }>;
  };
  stackBarData: {
    yearlyResults: Record<string, {
      categories: Record<string, number>;
    }>;
  };
  successProbability: SuccessProbability[];
}