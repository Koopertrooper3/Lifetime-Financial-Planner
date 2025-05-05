import mongoose, { Schema } from "mongoose";

const ProbabilityRangeChartSchema = new Schema({
  scenarioId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Scenario",
    required: true 
  },
  numScenario: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  selectedQuantity: {
    type: String,
    enum: ['totalInvestments', 'totalIncome', 'totalExpenses', 'earlyWithdrawalTax', 'discretionaryExpensesPercentage'],
    required: true
  },
  yearlyResults: {
    type: Map,
    of: new Schema({
      median: { type: Number, required: true },
      ranges: {
        "10-90": { type: [Number], required: true, validate: [(val: number[]) => val.length === 2, 'Range must have 2 values'] },
        "20-80": { type: [Number], required: true, validate: [(val: number[]) => val.length === 2, 'Range must have 2 values'] },
        "30-70": { type: [Number], required: true, validate: [(val: number[]) => val.length === 2, 'Range must have 2 values'] },
        "40-60": { type: [Number], required: true, validate: [(val: number[]) => val.length === 2, 'Range must have 2 values'] }
      }
    }),
    required: true
  },
});

export const ProbabilityRangeChartModel = mongoose.model('ProbabilityRangeChartModel',  ProbabilityRangeChartSchema);