import { Schema } from 'mongoose';
import { fixedValueSchema,normalDistSchema,uniformDistSchema } from './DistributionSchemas';

const options = {discriminatorKey: 'type', _id: false}

//Top interfaces
const distributionWrapper = new Schema({}, options)

const startTypeSchema = new Schema({}, options)

const durationTypeSchema = new Schema({}, options)

const eventDataSchema = new Schema({}, options)

export const eventSchema = new Schema({
    name: String,
    start: startTypeSchema,
    duration: durationTypeSchema,
    event: eventDataSchema
})

//Different event types
const eventStartField = eventSchema.path<Schema.Types.DocumentArray>('start');

const eventbasedStartSchema = new Schema({
    withOrAfter: {
        type: String,
        enum: ["with", "after"]
    },
    event: String
})

eventStartField.discriminator('Fixed',fixedValueSchema);
eventStartField.discriminator('Normal',normalDistSchema)
eventStartField.discriminator('Uniform',uniformDistSchema)
eventStartField.discriminator('EventBased',eventbasedStartSchema)

//Different duration types
const eventDurationField = eventSchema.path<Schema.Types.DocumentArray>('duration');

eventDurationField.discriminator('Fixed',fixedValueSchema);
eventDurationField.discriminator('Normal',normalDistSchema)
eventDurationField.discriminator('Uniform',uniformDistSchema)

//Different event types (income,expense,invest,rebalance)
const eventDataField = eventSchema.path<Schema.Types.DocumentArray>('event');

//Income schema
const incomeEventSchema = new Schema({
    initalAmount: Number,
    changeAmountOrPecent : {
        type: String,
        enum: ["amount","percent"]
    },
    changeDistribution: distributionWrapper,
    inflationAdjusted: Boolean,
    userFraction: Number,
    socialSecurity: Boolean,
})


const incomeChangeDistributionField = incomeEventSchema.path<Schema.Types.DocumentArray>('changeDistribution')
incomeChangeDistributionField.discriminator('Fixed',fixedValueSchema)
incomeChangeDistributionField.discriminator('Normal',normalDistSchema)
incomeChangeDistributionField.discriminator('Uniform',uniformDistSchema)

//Expense schema
const expenseEventSchema = new Schema({
    initalAmount: Number,
    changeAmountOrPecent : {
        type: String,
        enum: ["amount","percent"]
    },
    changeDistribution: distributionWrapper,
    inflationAdjusted: Boolean,
    userFraction: Number,
    discretionary: Boolean,
})
const expenseChangeDistributionField = expenseEventSchema.path<Schema.Types.DocumentArray>('changeDistribution')
expenseChangeDistributionField.discriminator('Normal',normalDistSchema)
expenseChangeDistributionField.discriminator('Uniform',uniformDistSchema)

//Invest schema
const assetProportion = new Schema({
    asset: String,
    proportion: Number,
})

const investEventSchema = new Schema({
    assetAllocation: [assetProportion],
    glidePath: Boolean,
    assetAllocation2: [assetProportion],
    maxCash: Number,

})

//Rebalance schema

const rebalanceEventSchema = new Schema({
    assetAllocation: [assetProportion]
})

eventDataField.discriminator('Income',incomeEventSchema);
eventDataField.discriminator('Expense',expenseEventSchema);
eventDataField.discriminator('Invest',investEventSchema);
eventDataField.discriminator('Rebalance',rebalanceEventSchema);


interface fixedDistribution {
    type: "Fixed",
    value: number,
}

interface normalDistribution {
    type: "Normal",
    mean: number,
    stdev: number,
}

interface uniformDistribution {
    type: "Uniform",
    lower: number,
    upper: number,
}

interface eventBased{
    type: "EventBased",
    withOrAfter: "with" | "before",
    event: string,
}
type eventStartType = fixedDistribution | normalDistribution | uniformDistribution | eventBased
type distributionWrapperType = fixedDistribution | normalDistribution | uniformDistribution

interface incomeEvent{
    type: "Income",
    initalAmount: number,
    changeAmountOrPercent: string,
    changeDistribution: distributionWrapperType,
    inflationAdjusted: boolean
    userFraction: number,
    socialSecurity: boolean
}

interface expenseEvent{
    type: "Expense",
    initalAmount: number,
    changeAmountOrPercent: string,
    changeDistribution: distributionWrapperType,
    inflationAdjusted: boolean,
    userFraction: number,
    discretionary: boolean
}

interface assetProportion {
    asset: string,
    proportion: number,
}

interface investEvent{
    type: "Invest",
    assetAllocation: assetProportion[],
    glidePath: boolean,
    assetAllocation2: assetProportion[],
    maxCash: number
}

interface rebalanceEvent{
    type: "Rebalance"
    assetAllocation: assetProportion[]
}

type eventData = incomeEvent | expenseEvent | investEvent | rebalanceEvent

export interface eventInterface{
    name: string,
    start: eventStartType,
    duration: distributionWrapperType,
    event: eventData
}