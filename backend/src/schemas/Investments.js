import mongoose from 'mongoose'

const investmentsSchema = new mongoose.Schema({
    investmentType: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    taxStatus: {
        type: String,
        enum: ["non-retirement", "pre-tax", "after-tax"],
        required: true,
    },
    id: {
        type: String,
        required: true
    },
});

const Investments = mongoose.model('Investments', investmentsSchema);

export default Investments;