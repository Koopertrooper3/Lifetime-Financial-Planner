import z from "zod";

export default z.object({
    id: z.string(),
    investmentType: z.string(),
    value: z.number(),
    taxStatus: z.enum(["Pre-tax","After-tax","Non-retirement","pre-tax","after-tax","non-retirement"], {
        errorMap: () => ({ message: "tax status must be `Non-Retirement`, `Pre-tax` or `After-tax`"})
    })
}).strict();