import mongoose, { Schema } from "mongoose"

const SuccessProbabilityChartSchema = new Schema({
  scenarioId: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
  numScenario: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  probabilities: [{
    year: {
      type: Number,
      required: true,
    },
    successRate: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    }
  }],
});


export const SuccessProbabiltyChartModel = mongoose.model('SuccessProbabiltyChartModel',  SuccessProbabilityChartSchema);
