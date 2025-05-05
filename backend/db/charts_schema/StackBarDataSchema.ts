import mongoose, { Schema } from "mongoose";

const StackBarDataSchema = new Schema({
  chartID: {
    type: String,
    required: true,
  },
  results: {
    type: Map,
    of:{
      average: {
        investments: {
          type: Map,
          of: Number,
          required: true
        },
        income: {
          type: Map,
          of: Number,
          required: true
        },
        expenses: {
          type: Map,
          of: Number,
          required: true
        }
      },
      median: {
        investments: {
          type: Map,
          of: Number,
          required: true
        },
        income: {
          type: Map,
          of: Number,
          required: true
        },
        expenses: {
          type: Map,
          of: Number,
          required: true
        }
      }
    }
    
  } 
});

// Create the model
export const StackBarDataModel = mongoose.model('StackBarData', StackBarDataSchema);