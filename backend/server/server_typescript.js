"use strict";
/*global console, setTimeout, clearTimeout*/
/*eslint no-undef: "error"*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const process_1 = __importDefault(require("process"));
const taxes_js_1 = require("../db/taxes.js");
const taxScraper_js_1 = require("../scraper/taxScraper.js");
const app = (0, express_1.default)();
const port = Number(process_1.default.env.BACKEND_PORT) || 8080;
const ip = process_1.default.env.BACKEND_IP || "0.0.0.0";
const databaseHost = process_1.default.env.DATABASE_HOST;
const databasePort = process_1.default.env.DATABASE_PORT;
const databaseName = process_1.default.env.DATABASE_NAME;
const databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName;
//Startup code to be run before the server starts
function startUp() {
    return __awaiter(this, void 0, void 0, function* () {
        //Open a connection to mongodb
        yield mongoose_1.default.connect(databaseConnectionString);
        //Query if we have the current tax year, if we do not run the scraper
        //TP: Code below created with Github Copilot with the prompt 
        //"Create a mongoose query that queries the federalTaxModel to check if the current tax year's information is in the database."
        //Code was outdated and replaced with the code below
        // const currentTaxYear = new Date().getFullYear()-1;
        // federalTaxModel.findOne({ year: currentTaxYear }, (err: unknown, taxData: unknown) => {
        //     if (err) {
        //         console.error('Error querying the database:', err);
        //         return;
        //     }
        //     if (!taxData) {
        //         console.log(`Tax data for the year ${currentTaxYear} not found. Running the scraper...`);
        //         // Call the scraper function here
        //         federalTaxScraper();
        //     } else {
        //         console.log(`Tax data for the year ${currentTaxYear} is already in the database.`);
        //     }
        // });
        const currentTaxYear = new Date().getFullYear() - 1;
        taxes_js_1.federalTaxModel.findOne({ year: currentTaxYear }).lean().then((taxData) => __awaiter(this, void 0, void 0, function* () {
            if (!taxData) {
                console.log(`Tax data for the year ${currentTaxYear} not found. Running the scraper...`);
                yield (0, taxScraper_js_1.federalTaxScraper)();
            }
            else {
                console.log(`Tax data for the year ${currentTaxYear} is already in the database.`);
            }
        }));
    });
}
startUp().then(() => {
    const server = app.listen(port, ip, () => {
        console.log(`Server listening on ip:${ip}, port:${port}`);
    });
    //gracefully handle server close on SIGINT(CTRL+C) by waiting for remaining request to finish
    process_1.default.once('SIGINT', () => {
        console.log("Server is now closing...");
        //timer to force server to shutdown even if there are active connections
        const timerShutDown = setTimeout(() => {
            console.log("Forcibly ending existing connection...");
            process_1.default.exit(0);
        }, 3000);
        server.close(() => {
            clearTimeout(timerShutDown);
            console.log("Server is now closed");
            process_1.default.exit(0);
        });
    });
});
//sample GET
app.get("/", (req, res) => {
    res.send("yeah");
});
app.post("/scenario/taxes/import", (req, res) => {
    res.send("yeah");
});
app.post("/scenario/runsimulation", (req, res) => {
    res.send("yeah");
    return;
});
// async () => {scraper.federalIncomeTaxScraper()}
//# sourceMappingURL=server_typescript.js.map