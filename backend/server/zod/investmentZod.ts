import z from "zod";

export default z.object({
    id: z.string(),
    investmentType: z.string(),
    value: z.number(),
    taxStatus: z.enum(["non-retirement", "pre-tax", "after-tax"], {
        errorMap: () => ({ message: "tax status must be `Non-retirement`, `Pre-tax` or `After-tax`"})
    })
}).strict();