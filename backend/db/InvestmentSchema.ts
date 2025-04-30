import mongoose from 'mongoose'

export const investmentSchema = new mongoose.Schema<Investment>({
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
        required: true,
    }
},{ _id : false });

export interface Investment{
    investmentType: string,
    value: number,
    taxStatus: "non-retirement" | "pre-tax" | "after-tax",
    id: string

}