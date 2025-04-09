import mongoose from 'mongoose'

export const investmentSchema = new mongoose.Schema({
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
        enum: ["Non-retirement", "Pre-tax", "After-tax"],
        required: true,
    },
    id: {
        type: String,
        required: true,
    }
});

export interface Investment{
    investmentType: string,
    value: number,
    taxStatus: "Non-retirement" | "Pre-tax" | "After-tax",
    id: string

}