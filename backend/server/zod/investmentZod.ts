import z from "zod";

export default z.object({
    id: z.string(),
    investmentType: z.string(),
    value: z.number(),
    taxStatus: z.enum(["pre-tax","after-tax","non-retirement"], {
        errorMap: () => ({ message: "tax status must be `non-retirement`, `pre-tax` or `after-tax`"})
    })
}).strict();