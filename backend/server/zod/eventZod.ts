import z from "zod";
import distributionZod from "./distributionZod";

const eventBasedStartZod = z.object({
    type: z.literal("EventBased"),
    withOrAfter: z.enum(["with", "after"], {
        errorMap: () => ({ message: "must be either with or after"})
    }),
    event: z.string()
}).strict();

const eventStartZod = z.discriminatedUnion("type", [
    ...distributionZod.options,
    eventBasedStartZod
]);

const incomeEventZod = z.object({
    type: z.literal("Income"),
    initialAmount: z.number(),
    changeAmountOrPercent: z.enum(["Amount","Percent"], {
        errorMap: () => ({ message: "must be either amount or percent"})
    }),
    changeDistribution: distributionZod,
    inflationAdjusted: z.boolean(),
    userFraction: z.number(),
    socialSecurity: z.boolean()
}).strict();

const expenseEventZod = z.object({
    type: z.literal("Expense"),
    initialAmount: z.number(),
    changeAmountOrPercent: z.enum(["Amount","Percent"], {
        errorMap: () => ({ message: "must be either amount or percent"})
    }),
    changeDistribution: distributionZod,
    inflationAdjusted: z.boolean(),
    userFraction: z.number(),
    discretionary: z.boolean()
}).strict();

const assetProportionZod = z.object({
    asset: z.string().min(1, "enter a string for asset field"),
    proportion: z.number()
}).strict();

const investEventZod = z.object({
    type: z.literal("Invest"),
    assetAllocation: assetProportionZod,
    glidePath: z.boolean(),
    assetAllocation2: assetProportionZod,
    maxCash: z.number()
}).strict();

const rebalanceEventZod = z.object({
    type: z.literal("Rebalance"),
    assetAllocation: assetProportionZod
}).strict();

const eventDataZod = z.discriminatedUnion("type", [
    incomeEventZod,
    expenseEventZod,
    investEventZod,
    rebalanceEventZod
]);

export default z.object({
    name: z.string().min(1, "please provide a valid string"),
    start: eventStartZod,
    duration: distributionZod,
    event: eventDataZod
});