import z from "zod";

export default z.object({
    id: z.string(),
    investmentType: z.string(),
    value: z.number(),
    taxStatus: z.enum(["Non-retirement", "Pre-tax", "After-tax"], {
        errorMap: () => ({ message: "tax status must be `Non-retirement`, `Pre-tax` or `After-tax`"})
    })
}).strict();