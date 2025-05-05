import mongoose, { Schema } from "mongoose";

const ProbabilityRangeChartSchema = new Schema({
  chartID: {
    type: String,
    required: true,
  },
  results: {
    type: Map,
    of: ({
      type: Map,
      of: new Schema({
        median: { type: Number, required: true },
        ranges: {
          "10-90": { type: [Number], required: true, validate: [(val: number[]) => val.length === 2, 'Range must have 2 values'] },
          "20-80": { type: [Number], required: true, validate: [(val: number[]) => val.length === 2, 'Range must have 2 values'] },
          "30-70": { type: [Number], required: true, validate: [(val: number[]) => val.length === 2, 'Range must have 2 values'] },
          "40-60": { type: [Number], required: true, validate: [(val: number[]) => val.length === 2, 'Range must have 2 values'] }
        }
      })
    }),
    required: true
  },
});

export const ProbabilityRangeChartModel = mongoose.model('ProbabilityRangeChartModel',  ProbabilityRangeChartSchema);