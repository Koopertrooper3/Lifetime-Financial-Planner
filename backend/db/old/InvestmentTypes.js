import mongoose from 'mongoose';

const investmentTypeScehma = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    returnAmtOrPct: {
        type: String,
        enum: ["amount", "percent"],
        required: true,
    },
    returnDistribution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Distribution',
        required: true,
    },
    expenseRatio: {
        type: Number,
        required: true,
    },
    incomeAmtOrPct: {
        type: String,
        enum: ["amount", "percent"],
        required: true,
    },
    incomeDistribution: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Distribution',
        required: true,
    },
    taxability: {
        type: Boolean,
        required: true
    },
});

const InvestmentType = mongoose.model('InvestmentType', investmentTypeScehma);

export default InvestmentType;