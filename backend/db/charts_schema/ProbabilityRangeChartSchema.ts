import mongoose, { Schema } from "mongoose"

const ProbabilityRangeChartSchema = new Schema({
  scenarioId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Scenario",
    required: true 
  },
  financialGoal: { type: Number, required: true},
  // Outer key is going to be years
  yearlyResults: {
    type: Map,
    of: new Schema({
      // Key: quantity type → value: array of raw simulation values
      totalInvestments: { type: [Number], default: [] },
      totalIncome: { type: [Number], default: [] },
      totalExpenses: { type: [Number], default: [] },
      earlyWithdrawalTax: { type: [Number], default: [] },
      percentDiscretionaryExpense: { type: [Number], default: [] }
    }),
    required: true
  },
})

const ProbabilityRangeChartModel = mongoose.model('SuccessProbabiltyChartModel',  ProbabilityRangeChartSchema);