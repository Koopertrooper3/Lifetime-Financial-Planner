import { Schema } from "mongoose"

export const fixedValueSchema = new Schema({
    value: Number
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
    upper: {
        type: Number,
        required: true
    },
    lower: {
        type: Number,
        required: true
    }
})