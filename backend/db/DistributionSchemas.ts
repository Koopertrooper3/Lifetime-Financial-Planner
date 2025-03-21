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
    lower: {
        type: Number,
        required: true
    },
    upper: {
        type: Number,
        required: true
    }
})