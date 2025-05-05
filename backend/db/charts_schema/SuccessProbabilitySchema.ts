import mongoose, { Schema } from "mongoose"

const SuccessProbabilityChartSchema = new Schema({
  chartID: {
    type: String,
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


export const SuccessProbabilityChartModel = mongoose.model('SuccessProbabiltyChartModel',  SuccessProbabilityChartSchema);
