import mongoose, {Schema} from 'mongoose';

const RawSimulationDataSchema = new Schema({
  scenarioId: { type: Schema.Types.ObjectId, ref: 'Scenario', required: true },
  financialGoal: { type: Number, required: true },
  yearlyResults: {
    type: Map, // year → quantity map
    of: new Schema({
      totalInvestments: [Number],
      totalIncome: [Number],
      totalExpenses: [Number],
      earlyWithdrawalTax: [Number],
      percentDiscretionaryExpense: [Number]
    }),
    required: true
  },
});

const RawSimulationDataModel = mongoose.model('RawSimulationDataModel',  RawSimulationDataSchema);

