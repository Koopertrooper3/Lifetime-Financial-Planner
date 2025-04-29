import mongoose, { Schema } from "mongoose"

const SuccessProbabilityChartSchema = new Schema({
  scenarioId: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
  quantity: { type: String, enum: ["totalInvestments"], required: true },
  financialGoal: { type: Number, required: true },
  probabilities: [{
    year: Number,
    successRate: Number // 0.0 to 1.0
  }],
  createdAt: { type: Date, default: Date.now }
});


const SuccessProbabiltyChartModel = mongoose.model('SuccessProbabiltyChartModel',  SuccessProbabilityChartSchema);
