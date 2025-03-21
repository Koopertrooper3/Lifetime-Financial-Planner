import mongoose from 'mongoose'
import InvestmentTypes from './InvestmentTypes'

const senarioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    maritalStatus: {
        type: String,
        enum: ["couple", "individual"],
    },
    birthYear: {
        type: [Number],
        validate: {
            validator: function(value){
                if(this.martialStatus === 'couple'){
                    return value.length == 2;
                }
                else if(this.martialStatus === 'individual'){
                    return value.length === 1;
                }
                else{
                    return false;
                }
            },
            message: "Invalid number of years for the given martial status"
        },
        required: true,
    },
    lifeExpectancy: {
        type: [mongoose.Schema.Types.ObjectId],
        validate: {
            validator: function(value){
                if(this.martialStatus === 'couple'){
                    return value.length == 2;
                }
                else if(this.martialStatus === 'individual'){
                    return value.length === 1;
                }
                else{
                    return false;
                }
            },
            message: "Invalid number of life expectancy entry for the given martial status"
        },
        required: true,
    },
    investmentTypes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'InvestmentTypes',
        required: true,
    },
    investments: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Investments',
        required: true,
    },
    eventSeries: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'EventSeries',
        required: true,
    },
    inflationAssumption: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Distribution',
        required: true,
    },
    afterTaxContributionLimit: {
        type: Number,
        required: true,
    },
    spendingStrategy: {
        type: [String],
        required: true,
    },
    expenseWithdrawalStrategy: {
        type: [String],
        required: true,
    },
    RMDStrategy: {
        type: [String],
        required: true,
    },
    RothConversionOpt: {
        type: Boolean,
        required: true,
    },
    RothConversionStart: {
        type: Number,
        required: true,
    },
    spendRothConversionEndingStrategy: {
        type: Boolean,
        required: true,
    },
    RothConversionStrategy: {
        type: [String],
        required: true,
    },
    financialGoal: {
        type: Number,
        required: true,
    },
    residenceState: {
        type: String,
        required: true,
    }
    
});

const Scenario = mongoose.model('Senario', senarioSchema);

export default Scenario;