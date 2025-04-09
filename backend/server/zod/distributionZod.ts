import z from "zod";

const baseDistribution = z.object({
    type: z.string()
});

const fixedDistribution = baseDistribution.extend({
    type: z.literal("Fixed"),
    value: z.number()
});

const normalDistribution = baseDistribution.extend({
    type: z.literal("Normal"),
    mean: z.number(),
    stdDev: z.number()
});
  
const uniformDistribution = baseDistribution.extend({
    type: z.literal("Uniform"),
    min: z.number(),
    max: z.number()
});

export default z.discriminatedUnion("type", [
    fixedDistribution,
    normalDistribution,
    uniformDistribution
]);