import z from "zod";
import distributionZod from "./distributionZod";

export default z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    returnAmtOrPct: z.enum(["Amount", "Percent"], {
        errorMap: () => ({ message: "returnAmtOrPct must be either 'amount' or 'percent'" }),
    }),
    returnDistribution: distributionZod,
    expenseRatio: z.number().min(0, "Expense ratio cannot be negative"),
    incomeAmtOrPct: z.enum(["Amount", "Percent"], {
        errorMap: () => ({message: "Income type must be 'amount' or 'percent'"}),
    }),
    incomeDistribution: distributionZod,
    taxability: z.boolean()
}).strict();