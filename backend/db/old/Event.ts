/* eslint-disable @typescript-eslint/no-unused-vars */
import { Schema, model } from 'mongoose';
import { fixedValueSchema,normalDistSchema,uniformDistSchema } from '../DistributionSchemas';

const options = {discriminatorKey: 'type'}

//Top interfaces
const distributionWrapper = new Schema({}, options)

const multiTypeSchema = new Schema({}, options)

const eventSchema = new Schema({
    name: {
        type: String,
    },
    start: multiTypeSchema,
    duration: multiTypeSchema,
    event: multiTypeSchema
})

const Event = model('Event', eventSchema);

//Different event types
const eventStartField = eventSchema.path<Schema.Types.DocumentArray>('start');

const eventbasedStartSchema = new Schema({
    withOrAfter: {
        type: String,
        enum: ["with", "after"]
    },
    event: {
        type: String
    }
})

eventStartField.discriminator('Fixed',fixedValueSchema);
eventStartField.discriminator('Normal',normalDistSchema)
eventStartField.discriminator('Uniform',uniformDistSchema)
eventStartField.discriminator('EventBased',eventbasedStartSchema)

const eventDurationField = eventSchema.path<Schema.Types.DocumentArray>('duration');

eventDurationField.discriminator('Fixed',fixedValueSchema);
eventDurationField.discriminator('Normal',normalDistSchema)
eventDurationField.discriminator('Uniform',uniformDistSchema)

const eventDataField = eventSchema.path<Schema.Types.DocumentArray>('event');

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
incomeChangeDistributionField.discriminator('Normal',normalDistSchema)
incomeChangeDistributionField.discriminator('Uniform',uniformDistSchema)

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
const rebalanceEventSchema = new Schema({
    assetAllocation: [assetProportion]
})

eventDataField.discriminator('Income',incomeEventSchema);
eventDataField.discriminator('Expense',expenseEventSchema);
eventDataField.discriminator('Invest',investEventSchema);
eventDataField.discriminator('Rebalance',rebalanceEventSchema);

export default Event