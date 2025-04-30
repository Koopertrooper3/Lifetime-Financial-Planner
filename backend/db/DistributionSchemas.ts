import { Schema } from "mongoose"

export const fixedValueSchema = new Schema({
    value: {
        type: Number,
        required: true
    }
},{ _id : false })

export const normalDistSchema = new Schema({
    mean: {
        type: Number,
        required: true
    },
    stdev: {
        type: Number,
        required: true
    }
},{ _id : false })

export const uniformDistSchema = new Schema<UniformDistribution>({
    lower: {
        type: Number,
        required: true
    },
    upper: {
        type: Number,
        required: true
    }
},{ _id : false })

export interface FixedDistribution {
    type: "fixed",
    value: number,
}

export interface NormalDistribution {
    type: "normal",
    mean: number,
    stdev: number,
}

export interface UniformDistribution {
    type: "uniform",
    lower: number,
    upper: number,
}