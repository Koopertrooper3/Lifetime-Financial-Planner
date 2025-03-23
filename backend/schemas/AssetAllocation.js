import mongoose from 'mongoose'

const assetAllocationSchema = new mongoose.Schema({
    "S&P 500 non-retirement": { type: Number, required: true },
    "S&P 500 after-tax": { type: Number, required: true }
});

const AssetAllocation = mongoose.model('AssetAllocation', assetAllocationSchema);

export default AssetAllocation;