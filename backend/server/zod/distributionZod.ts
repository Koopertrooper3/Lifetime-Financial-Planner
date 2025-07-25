import z from "zod";

const fixedDistribution = z.object({
  type: z.literal("fixed"),
  value: z.number()
}).strict();

const normalDistribution = z.object({
  type: z.literal("normal"),
  mean: z.number(),
  stdev: z.number(),
  // Make min/max optional for normal distribution
  min: z.number().optional(),
  max: z.number().optional() 
}).strict();

const uniformDistribution = z.object({
  type: z.literal("uniform"),
  // Using both lower/upper AND min/max for compatibility
  lower: z.number(),
  upper: z.number(),
  min: z.number().optional(),
  max: z.number().optional()
}).strict();

export default z.discriminatedUnion("type", [
  fixedDistribution,
  normalDistribution,
  uniformDistribution
]);