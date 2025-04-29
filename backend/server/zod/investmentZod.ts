import z from "zod";

export default z.object({
    id: z.string(),
    investmentType: z.string(),
    value: z.number(),
    taxStatus: z.enum(["Pre-Tax","After-Tax","Non-Retirement"], {
        errorMap: () => ({ message: "tax status must be `Non-retirement`, `Pre-tax` or `After-tax`"})
    })
}).strict();