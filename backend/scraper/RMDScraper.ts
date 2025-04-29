import {firefox} from 'playwright';
import dotenv from "dotenv"
import path from 'path';

dotenv.config({ path: path.resolve(__dirname,'..','..','..','.env')})
const RMDTableWebsite = process.env.RMD_TABLE_WEBSITE || ""

export async function RMDScraper(){
    const browser = await firefox.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        javaScriptEnabled: false
    });
    const page = await context.newPage();
    await page.goto(RMDTableWebsite);
    const RMDTable : Record<number,number> = {};
    //getByRole('table', { name: 'Appendix B. Uniform Lifetime' }).getByRole('row').nth(5-29).getByRole('cell").nth(0-4)

    const WebsiteRMDTable = await page.getByRole('table', { name: 'Appendix B. Uniform Lifetime' }).getByRole('row').all()

    for(let row = 5; row < 30; row++){

        const RMDTableCells = await WebsiteRMDTable[row].getByRole('cell').all()

        const [age1, dist1, age2, dist2] = await Promise.all([RMDTableCells[0].textContent(),RMDTableCells[1].textContent(),RMDTableCells[2].textContent(),RMDTableCells[3].textContent()])
        //console.log(`${age1} ${dist1} ${age2} ${dist2}`)

        if(age1 == null || dist1 == null || age2 == null || dist2 == null){
            throw new Error("Age1 or dist1 null")
        }

        RMDTable[Number(age1)] = Number(dist1)


        if(age2 != " "){
            if(age2?.includes(" and over")){
                const endAgeString = age2.replace(" and over", "")
                RMDTable[Number(endAgeString)] = Number(dist2)
            }else{
                RMDTable[Number(age2)] = Number(dist2)
            }
        }
        
    }

    return RMDTable
}