import mongoose from 'mongoose';


//Events can start based on
//fixed value
//other events
//distribution
const options = {discriminationKey: 'kind'}

const blab = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    start: startTypeSchema,
    duration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Distribution',
        required: true,
    },
    type: {
        type: String,
        enum: ["income", "expense", "invest", "rebalance"],
        required: true,
    },
    initialAmount: {
        type: Number,
        required: false
    },
    changeAmtOrPct: {
        type: String,
        enum: ["amount", "percent"],
        required: true,
    },
    changeDistribution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Distribution',
        required: false,
    },
    inflationAdjusted: {
        type: Boolean,
        required: false,
    },
    userFraction: {
        type: Number,
        required: false,
    },
    socialSecruity: {
        type: Boolean,
        required: false,
    },
    discretionary: {
        type: Boolean,
        required: false,
    },
    gliadePath: {
        type: Boolean,
        required: false,
    },
    assetAllocation: [{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'AssetAllocation',
        required: false,
        validate: {
            validator: function (value) {
                return value === undefined || (Array.isArray(value) && value.length > 0);
            },
            message: 'If provided, assetAllocation must have at least one item.'
        }
    }],
    assetAllocation2: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'AssetAllocation',
        required: false,
        validate: {
            validator: function (value) {
                return value === undefined || (Array.isArray(value) && value.length > 0);
            },
            message: 'If provided, assetAllocation must have at least one item.'
        }
    },
    maxCash: {
        type: Number,
        required: false,
    },
});


const EventSeries = mongoose.model('EventSeries', eventSeriesSchema);

export default EventSeries;