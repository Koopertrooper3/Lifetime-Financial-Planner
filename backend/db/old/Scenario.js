/* eslint-disable @typescript-eslint/no-unused-vars */
import {Schema,model} from 'mongoose'
import InvestmentTypes from './InvestmentTypes'
import { fixedValueSchema,normalDistSchema,uniformDistSchema } from './DistributionSchemas';

const options = {discriminatorKey: 'type'}

const distributionWrapper = new Schema({}, options)

const senarioSchema = new Schema({
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
        type: [Schema.Types.ObjectId],
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
        type: [Schema.Types.ObjectId],
        ref: 'InvestmentTypes',
        required: true,
    },
    investments: {
        type: [Schema.Types.ObjectId],
        ref: 'Investments',
        required: true,
    },
    eventSeries: {
        type: [Schema.Types.ObjectId],
        ref: 'Event',
        required: true,
    },
    inflationAssumption: {
        type: distributionWrapper,
        required: true
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
    RothConversionEnd: {
        type: Number,
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

const inflationAssumptionField = senarioSchema.path('inflationAssumption');

inflationAssumptionField.discriminator('Fixed',fixedValueSchema);
inflationAssumptionField.discriminator('Normal',normalDistSchema)
inflationAssumptionField.discriminator('Uniform',uniformDistSchema)

const Scenario = model('Senario', senarioSchema);

export default Scenario;