import mongoose, { Schema } from "mongoose";

const StackBarDataSchema = new Schema({
  chartID: {
    type: String,
    required: true,
  },
  aggregationThreshold: {
    type: Number,
    required: true
  },
  useMedian: {
    type: Boolean,
    required: true
  },
  yearlyResults: {
    type: Map,
    of: new Schema({
      // Key: category name, Value: aggregated value
      categories: {
        type: Map,
        of: Number,
        required: true
      },
    }),
    required: true
  }
});

export const StackBarDataModel = mongoose.model('StackBarDataModel', StackBarDataSchema);