import {Schema} from 'mongoose';
import { fixedValueSchema,FixedDistribution, normalDistSchema, NormalDistribution, uniformDistSchema, UniformDistribution } from './DistributionSchemas';



const distributionWrapper = new Schema({}, {discriminatorKey: 'type'})

export const investmentTypeSchema = new Schema<InvestmentType>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    returnAmtOrPct: {
        type: String,
        enum: ["Amount", "Percent"],
        required: true,
    },
    returnDistribution: {
        type: distributionWrapper,
        required: true,
    },
    expenseRatio: {
        type: Number,
        required: true,
    },
    incomeAmtOrPct: {
        type: String,
        enum: ["Amount", "Percent"],
        required: true,
    },
    incomeDistribution: {
        type: distributionWrapper,
        required: true
    },
    taxability: {
        type: Boolean,
        required: true
    },
});

const returnDistributionField = investmentTypeSchema.path<Schema.Types.DocumentArray>('returnDistribution');

returnDistributionField.discriminator('Fixed',fixedValueSchema);
returnDistributionField.discriminator('Normal',normalDistSchema)
returnDistributionField.discriminator('Uniform',uniformDistSchema)

const incomeDistributionField = investmentTypeSchema.path<Schema.Types.DocumentArray>('incomeDistribution');

incomeDistributionField.discriminator('Fixed',fixedValueSchema);
incomeDistributionField.discriminator('Normal',normalDistSchema)
incomeDistributionField.discriminator('Uniform',uniformDistSchema)

export type ReturnDistribution = FixedDistribution | NormalDistribution | UniformDistribution
export type IncomeDistribution = FixedDistribution | NormalDistribution | UniformDistribution

export interface InvestmentType {
    name: string,
    description: string,
    returnAmtOrPct: "Amount" | "Percent",
    returnDistribution: ReturnDistribution,
    expenseRatio: number,
    incomeAmtOrPct: "Amount" | "Percent",
    incomeDistribution: IncomeDistribution,
    taxability: boolean
}