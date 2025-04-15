import z from "zod";

const stateTaxBracketZod = z.object({
    rate: z.number(),
    lower_threshold: z.number(),
    upper_threshold: z.number(),
    flat_adjustment: z.number()
}).strict();

const stateTaxZod = z.object({
    state: z.string(),
    year: z.number(),
    single_income_tax: z.array(stateTaxBracketZod),
    married_income_tax: z.array(stateTaxBracketZod)
}).strict();

export { stateTaxBracketZod, stateTaxZod }