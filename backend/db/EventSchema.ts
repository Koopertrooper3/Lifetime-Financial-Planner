import { Schema } from 'mongoose';
import { fixedValueSchema,normalDistSchema,uniformDistSchema,FixedDistribution,NormalDistribution,UniformDistribution } from './DistributionSchemas';

const options = {discriminatorKey: 'type', _id: false}

//Top interfaces
const distributionWrapper = new Schema({}, options)

const startTypeSchema = new Schema({}, options)

const durationTypeSchema = new Schema({}, options)

const eventDataSchema = new Schema({}, options)

export const eventSchema = new Schema<Event>({
    name: String,
    start: startTypeSchema,
    duration: durationTypeSchema,
    event: eventDataSchema
})

//Different event types
const eventStartField = eventSchema.path<Schema.Types.DocumentArray>('start');

const eventbasedStartSchema = new Schema<eventBased>({
    eventSeries: String
})

eventStartField.discriminator('fixed',fixedValueSchema);
eventStartField.discriminator('normal',normalDistSchema)
eventStartField.discriminator('uniform',uniformDistSchema)
eventStartField.discriminator('startsWith',eventbasedStartSchema)
eventStartField.discriminator('startsAfter',eventbasedStartSchema)

//Different duration types
const eventDurationField = eventSchema.path<Schema.Types.DocumentArray>('duration');

eventDurationField.discriminator('fixed',fixedValueSchema);
eventDurationField.discriminator('normal',normalDistSchema)
eventDurationField.discriminator('uniform',uniformDistSchema)

//Different event types (income,expense,invest,rebalance)
const eventDataField = eventSchema.path<Schema.Types.DocumentArray>('event');

//Income schema
const incomeEventSchema = new Schema<incomeEvent>({
    initialAmount: Number,
    changeAmtOrPct : {
        type: String,
        enum: ["amount","percent"]
    },
    changeDistribution: distributionWrapper,
    inflationAdjusted: Boolean,
    userFraction: Number,
    socialSecurity: Boolean,
})


const incomeChangeDistributionField = incomeEventSchema.path<Schema.Types.DocumentArray>('changeDistribution')
incomeChangeDistributionField.discriminator('fixed',fixedValueSchema)
incomeChangeDistributionField.discriminator('normal',normalDistSchema)
incomeChangeDistributionField.discriminator('uniform',uniformDistSchema)

//Expense schema
const expenseEventSchema = new Schema<expenseEvent>({
    initialAmount: Number,
    changeAmtOrPct : {
        type: String,
        enum: ["amount","percent"]
    },
    changeDistribution: distributionWrapper,
    inflationAdjusted: Boolean,
    userFraction: Number,
    discretionary: Boolean,
})
const expenseChangeDistributionField = expenseEventSchema.path<Schema.Types.DocumentArray>('changeDistribution')
expenseChangeDistributionField.discriminator('normal',normalDistSchema)
expenseChangeDistributionField.discriminator('uniform',uniformDistSchema)

//Invest schema
const assetProportion = new Schema<assetProportion>({
    asset: String,
    proportion: Number,
})

const investEventSchema = new Schema<investEvent>({
    assetAllocation: {
        type: Map,
        of: Number
    },
    glidePath: Boolean,
    assetAllocation2: {
        type: Map,
        of: Number
    },
    maxCash: Number,
})

//Rebalance schema

const rebalanceEventSchema = new Schema<rebalanceEvent>({
    taxStatus: {
        type: String,
        enum: ["pre-tax","after-tax","non-retirement"]
    },
    assetAllocation: {
        type: Map,
        of: Number
    },
    glidePath: Boolean,
    assetAllocation2: {
        type: Map,
        of: Number
    },
})

eventDataField.discriminator('income',incomeEventSchema);
eventDataField.discriminator('expense',expenseEventSchema);
eventDataField.discriminator('invest',investEventSchema);
eventDataField.discriminator('rebalance',rebalanceEventSchema);

interface eventBased{
    type: "startWith" | "startAfter",
    eventSeries: string,
}
export type eventStartType = FixedDistribution | NormalDistribution | UniformDistribution | eventBased
export type EventDistribution = FixedDistribution | NormalDistribution | UniformDistribution

export interface incomeEvent{
    type: "income",
    initialAmount: number,
    changeAmtOrPct: "amount" | "percent",
    changeDistribution: EventDistribution,
    inflationAdjusted: boolean
    userFraction: number,
    socialSecurity: boolean
}

export interface expenseEvent{
    type: "expense",
    initialAmount: number,
    changeAmtOrPct: "amount" | "percent",
    changeDistribution: EventDistribution,
    inflationAdjusted: boolean,
    userFraction: number,
    discretionary: boolean
}

export interface assetProportion {
    asset: string,
    proportion: number,
}

export interface investEvent{
    type: "invest",
    assetAllocation: Record<string,number>,
    glidePath: boolean,
    assetAllocation2: Record<string,number>,
    maxCash: number
}

type TaxStatus = "pre-tax" | "after-tax" | "non-retirement"
export interface rebalanceEvent{
    type: "rebalance",
    taxStatus: TaxStatus,
    assetAllocation: Record<string,number>,
    glidePath: boolean,
    assetAllocation2: Record<string,number>,
}

type eventData = incomeEvent | expenseEvent | investEvent | rebalanceEvent

export interface Event{
    name: string,
    start: eventStartType,
    duration: EventDistribution,
    event: eventData
}