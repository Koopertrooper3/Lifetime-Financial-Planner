import z from "zod";
import distributionZod from "./distributionZod";

// 1. Define the base fields that ALL events share
const baseEventSchema = z.object({
  name: z.string().min(1),
  start: z.discriminatedUnion("type", [
    z.object({ type: z.literal("fixed"), value: z.number() }),
    z.object({ type: z.literal("uniform"), lower: z.number(), upper: z.number() }),
    z.object({ type: z.literal("startWith"), eventSeries: z.string() }),
    z.object({ type: z.literal("startAfter"), eventSeries: z.string() })
  ]),
  duration: distributionZod,
});

// 2. Define type-specific schemas that EXTEND the base schema
const incomeEventSchema = baseEventSchema.extend({
  type: z.literal("income"),
  initialAmount: z.number(),
  changeAmtOrPct: z.enum(["amount", "percent", "Amount", "Percent"]),
  changeDistribution: distributionZod,
  inflationAdjusted: z.boolean(),
  userFraction: z.number(),
  socialSecurity: z.boolean()
});

const expenseEventSchema = baseEventSchema.extend({
  type: z.literal("expense"),
  initialAmount: z.number(),
  changeAmtOrPct: z.enum(["amount", "percent", "Amount", "Percent"]),
  changeDistribution: distributionZod,
  inflationAdjusted: z.boolean(),
  userFraction: z.number(),
  discretionary: z.boolean()
});

const assetAllocationSchema = z.record(z.string(), z.number())

const investEventSchema = baseEventSchema.extend({
  type: z.literal("invest"),
  assetAllocation: assetAllocationSchema,
  glidePath: z.boolean(),
  assetAllocation2: assetAllocationSchema.optional(),
  maxCash: z.number()
});

const rebalanceEventSchema = baseEventSchema.extend({
  type: z.literal("rebalance"),
  taxStatus: z.enum(["Pre-Tax","After-Tax","Non-Retirement","pre-tax","after-tax","non-retirement"]).optional(),
  assetAllocation: assetAllocationSchema,
  glidePath: z.boolean().optional(),
  assetAllocation2: assetAllocationSchema.optional(),
});

// 3. Combine all event types into one schema
const eventSchema = z.discriminatedUnion("type", [
  incomeEventSchema,
  expenseEventSchema,
  investEventSchema,
  rebalanceEventSchema
]);

export default eventSchema;