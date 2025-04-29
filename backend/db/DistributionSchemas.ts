import { Schema } from "mongoose"

export const fixedValueSchema = new Schema({
    value: {
        type: Number,
        required: true
    }
})

export const normalDistSchema = new Schema({
    mean: {
        type: Number,
        required: true
    },
    stdev: {
        type: Number,
        required: true
    }
})

export const uniformDistSchema = new Schema({
    min: {
        type: Number,
        required: true
    },
    max: {
        type: Number,
        required: true
    }
})

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
    min: number,
    max: number,
}