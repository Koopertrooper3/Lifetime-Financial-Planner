import z from "zod";
import distributionZod from "./distributionZod";
import investmentTypeZod from './investmentTypeZod';
import investmentZod from './investmentZod';
import eventZod from './eventZod';

export default z.object({
    name: z.string().min(1, "Name is required and currently empty"),
    maritalStatus: z.enum(["couple", "Couple", "individual", "Individual"], {
        errorMap: () => ({ message: "Marital status must be either 'couple' or 'individual'" }),
    }),
    birthYears: z.array(z.number().min(0, "birthYears can't be negative")),
    lifeExpectancy: z.array(distributionZod),
    // investmentTypes: z.array(investmentTypeZod),
    // investments: z.array(investmentZod),
    // eventSeries: z.array(eventZod),
    investmentTypes: z.record(z.string(), investmentTypeZod),
    investments: z.record(z.string(), investmentZod),
    eventSeries: z.record(z.string(), eventZod),
    inflationAssumption: distributionZod,
    afterTaxContributionLimit: z.number(),
    spendingStrategy: z.array(z.string()),
    expenseWithdrawalStrategy: z.array(z.string()),
    RMDStrategy: z.array(z.string()),
    RothConversionOpt: z.boolean(),
    RothConversionStart: z.number(),
    RothConversionEnd: z.number(),
    RothConversionStrategy: z.array(z.string()),
    financialGoal: z.number(),
    residenceState: z.string()
})
.strict()
.superRefine((val, ctx) => {
    if(val.maritalStatus === 'individual'){
        if(val.birthYears.length !== 1){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "individual must have only one birthYear"
            });
        }
        if(val.lifeExpectancy.length !== 1){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "individual must have one lifeExpectancy"
            })
        }
    }

    if(val.maritalStatus === 'couple'){
        if(val.birthYears.length !== 2){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "couple must have two birthYear"
            });
        }
        if(val.lifeExpectancy.length !== 2){
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "couple must have two lifeExpectancy"
            })
        }
    }
})