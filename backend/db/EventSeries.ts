/* eslint-disable @typescript-eslint/no-unused-vars */
import { Schema, model } from 'mongoose';
import { fixedValueSchema,normalDistSchema,uniformDistSchema } from './Distribution';

const options = {discriminatorKey: 'kind'}

//Top interfaces
const eventStartSchema = new Schema({
    type: String
}, options)

const eventDurationSchema = new Schema({
    type: String
}, options)

const eventDataSchema = new Schema({
    type: String
}, options)

const distributionWrapper = new Schema({
    type: String
}, options)

const multiTypeSchema = new Schema({
    type: String
}, options)

const eventSeriesSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    start: multiTypeSchema,
    duration: multiTypeSchema,
    event: multiTypeSchema
})


//Different event types
const eventStartField = eventSeriesSchema.path<Schema.Types.DocumentArray>('start');

const eventbasedStartSchema = new Schema({
    beforeOrAfter: {
        type: String,
        enum: ["before", "after"]
    }
})

eventStartField.discriminator('fixed',fixedValueSchema);
eventStartField.discriminator('normal',normalDistSchema)
eventStartField.discriminator('uniform',uniformDistSchema)
eventStartField.discriminator('eventBased',eventbasedStartSchema)

const eventDurationField = eventSeriesSchema.path<Schema.Types.DocumentArray>('duration');

eventDurationField.discriminator('fixed',fixedValueSchema);
eventDurationField.discriminator('normal',normalDistSchema)
eventDurationField.discriminator('uniform',uniformDistSchema)

const eventDataField = eventSeriesSchema.path<Schema.Types.DocumentArray>('event');

const incomeEventSchema = new Schema({
    initalAmount: Number,
    changeAmountOrPecentage : {
        type: String,
        enum: ["amount","percent"]
    },
    changeDistribution: distributionWrapper,
    inflationAdjusted: Boolean,
    userFraction: Number,
    socialSecurity: Boolean,
})

const incomeChangeDistributionField = incomeEventSchema.path<Schema.Types.DocumentArray>('changeDistribution')
incomeChangeDistributionField.discriminator('normal',normalDistSchema)
incomeChangeDistributionField.discriminator('uniform',uniformDistSchema)

const expenseEventSchema = new Schema({
    initalAmount: Number,
    changeAmountOrPecentage : {
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

eventDataField.discriminator('incomeEvent',incomeEventSchema);
eventDataField.discriminator('incomeEvent',expenseEventSchema);
eventDataField.discriminator('incomeEvent',investEventSchema);
eventDataField.discriminator('incomeEvent',rebalanceEventSchema);

export const eventSeries = model('EventSeries', eventSeriesSchema);
