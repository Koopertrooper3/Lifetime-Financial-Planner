import {Schema,model} from 'mongoose'
import { fixedValueSchema,normalDistSchema,uniformDistSchema, FixedDistribution, NormalDistribution, UniformDistribution } from './DistributionSchemas';
import {eventSchema} from './EventSchema'
import { Event } from './EventSchema';
import InvestmentType from './InvestmentTypes';
import {Investment, investmentSchema} from './InvestmentSchema';

const options = {discriminatorKey: 'type'}

const distributionWrapper = new Schema({}, options)

const senarioSchema = new Schema<Scenario>({
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
            validator: function(value: number[]){
                if((this as Scenario).maritalStatus === 'couple') {
                    return value.length == 2;
                }
                else if((this as Scenario).maritalStatus === 'couple')
                {
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
        type: [distributionWrapper],
        validate: {
            validator: function(value: unknown[]){
                if((this as Scenario).maritalStatus === 'couple'){
                    return value.length == 2;
                }
                else if((this as Scenario).maritalStatus === 'individual'){
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
        ref: InvestmentType.modelName,
        required: true,
    },
    investments: {
        type: [investmentSchema],
        required: true,
        default: []
    },
    eventSeries: {
        type: [eventSchema],
        required: true,
        default: []
    },
    inflationAssumption: {
        type: distributionWrapper,
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

const lifeExpectancyField = senarioSchema.path<Schema.Types.DocumentArray>('lifeExpectancy');

lifeExpectancyField.discriminator('Fixed',fixedValueSchema);
lifeExpectancyField.discriminator('Normal',normalDistSchema)
lifeExpectancyField.discriminator('Uniform',uniformDistSchema)

const inflationAssumptionField = senarioSchema.path<Schema.Types.DocumentArray>('inflationAssumption');

inflationAssumptionField.discriminator('Fixed',fixedValueSchema);
inflationAssumptionField.discriminator('Normal',normalDistSchema)
inflationAssumptionField.discriminator('Uniform',uniformDistSchema)

export const scenarioModel = model('Scenario', senarioSchema);


export interface Scenario {
    name: string,
    maritalStatus: string,
    birthYear: number[],
    lifeExpectancy: (FixedDistribution | NormalDistribution | UniformDistribution)[]
    investmentTypes: Schema.Types.ObjectId[],
    investments: Investment[],
    eventSeries: Event[],
    inflationAssumption: FixedDistribution | NormalDistribution | UniformDistribution,
    afterTaxContributionLimit: number,
    spendingStrategy: string[],
    expenseWithdrawalStrategy: string[],
    RMDStrategy: string[],
    RothConversionOpt: boolean,
    RothConversionStart: number,
    RothConversionEnd: number,
    RothConversionStrategy: string[],
    financialGoal: number,
    residenceState: string,
}