import z from "zod";

export default z.object({
    investmentType: z.string(),
    value: z.number(),
    taxStatus: z.enum(["Non-retirement", "Pre-tax", "After-tax"], {
        errorMap: () => ({ message: "tax status must be `Non-retirement`, `Pre-tax` or `After-tax`"})
    }),
    id: z.number()
}).strict();