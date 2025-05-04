import { Scenario} from "../db/Scenario"
import { FederalTax, StateTax } from "../db/taxes"
import { Event as ScenarioEvent } from "../db/EventSchema"
import { Investment } from "../db/InvestmentSchema"

export interface threadData {

    username: string,
    scenarioID : string, 
    threadNumber: number
    simulationsPerThread: number,
    scenario: Scenario,
    federalTaxes : FederalTax,
    stateTaxes: StateTax
}

/**
 * Description placeholder
 *
 */
export interface Result{
    completed: number,
    succeeded: number,
    failed: number,
    simulationRecords: Record<number,AnnualResults[]>
  }

export interface TaxBracketContainer {
    "Federal" : FederalTax,
    "State" : StateTax
}
/**
 * Description placeholder
 *
 * @async
 * @param {threadData} threadData 
 * @returns {unknown} 
 */

export interface AnnualValues {
    totalIncome : number,
    totalSocialSecurityIncome: number,
    totalEarlyWithdrawal : number,
    totalCapitalGains : number,
}

export interface ExpenseObject {
    expenseAmount : number
    logMessage : string
}
export interface payNonDescExpensesReturn{
    allExpensesPaid: boolean,
    adjustedEventSeries : Record<string,ScenarioEvent>,
    adjustedAccounts : Record<string,Investment>,
    totalIncome : number,
    totalCapitalGain : number,
    earlyWithdrawal : number,
    nonDescExpenseLogMessages : string[]
}
export interface payDiscExpensesReturn {
    adjustedAccounts : Record<string,Investment>,
    adjustedEventSeries : Record<string,ScenarioEvent>,
    totalIncome : number,
    earlyWithdrawal : number,
    totalCapitalGain : number,
    totalDiscretionaryExpenses : number,
    totalIncurredDiscretionaryExpenses : number
    expenseBreakdown : Record<string,number>,
    discExpenseLogMessages : string[]
}
export interface ExpenseObject {
    name: string,
    expenseAmount : number
    logMessage : string
}
export interface payNonDescExpensesReturn{
    allExpensesPaid: boolean,
    adjustedEventSeries : Record<string,ScenarioEvent>,
    adjustedAccounts : Record<string,Investment>,
    totalIncome : number,
    totalCapitalGain : number,
    earlyWithdrawal : number,
    totalAnnualExpenses : number,
    expenseBreakdown: Record<string,number>,
    nonDescExpenseLogMessages : string[]
}

export interface AnnualResults {
    finanicalGoal: boolean,
    income: number,
    totalInvestments: number,
    totalExpenses: number,
    earlyWithdrawalTax: number,
    percentageOfTotalDiscretionaryExpenses: number
}

export interface InvestmentBreakdown{
    value: number,
    taxStatus: string,
}
