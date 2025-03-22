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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var mongoose_1 = require("mongoose");
var process = require("process");
var taxes_1 = require("../db/taxes");
var taxScraper_1 = require("../scraper/taxScraper");
var bullmq_1 = require("bullmq");
var body_parser_1 = require("body-parser");
var app_1 = require("./app");
dotenv.config();
var port = Number(process.env.BACKEND_PORT) || 8080;
var ip = process.env.BACKEND_IP || "0.0.0.0";
var databaseHost = process.env.DATABASE_HOST;
var databasePort = process.env.DATABASE_PORT;
var databaseName = process.env.DATABASE_NAME;
var databaseConnectionString = databaseHost + ':' + databasePort + '/' + databaseName;
var REDIS_HOST = process.env.REDIS_HOST || "localhost";
var REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
var jsonParser = body_parser_1.default.json();
var simulatorQueue;
//Startup code to be run before the server starts
function startUp() {
    return __awaiter(this, void 0, void 0, function () {
        var currentTaxYear;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                //Open a connection to mongodb
                return [4 /*yield*/, mongoose_1.default.connect(databaseConnectionString)];
                case 1:
                    //Open a connection to mongodb
                    _a.sent();
                    currentTaxYear = new Date().getFullYear() - 1;
                    taxes_1.federalTaxModel.findOne({ year: currentTaxYear }).lean().then(function (taxData) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!!taxData) return [3 /*break*/, 2];
                                    console.log("Tax data for the year ".concat(currentTaxYear, " not found. Running the scraper..."));
                                    return [4 /*yield*/, (0, taxScraper_1.federalTaxScraper)()];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    console.log("Tax data for the year ".concat(currentTaxYear, " is already in the database."));
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    simulatorQueue = new bullmq_1.Queue('simulatorQueue', {
                        connection: {
                            host: REDIS_HOST,
                            port: REDIS_PORT,
                        },
                    });
                    return [2 /*return*/];
            }
        });
    });
}
startUp().then(function () {
    var server = app_1.default.listen(port, ip, function () {
        console.log("Server listening on ip:".concat(ip, ", port:").concat(port));
    });
    //gracefully handle server close on SIGINT(CTRL+C) by waiting for remaining request to finish
    process.once('SIGINT', function () {
        console.log("Server is now closing...");
        //timer to force server to shutdown even if there are active connections
        var timerShutDown = setTimeout(function () {
            console.log("Forcibly ending existing connection...");
            process.exit(0);
        }, 3000);
        server.close(function () {
            clearTimeout(timerShutDown);
            console.log("Server is now closed");
            process.exit(0);
        });
    });
});
//sample GET
app_1.default.get("/", function (req, res) {
    res.send("yeah");
});
app_1.default.post("/scenario/taxes/import", function (req, res) {
    res.send("yeah");
});
app_1.default.post("/scenario/runsimulation", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var requestBody;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                requestBody = req.body;
                return [4 /*yield*/, simulatorQueue.add("simulatorQueue", { scenarioID: requestBody.scenarioID }, { removeOnComplete: true, removeOnFail: true })];
            case 1:
                _a.sent();
                res.status(200).send({});
                return [2 /*return*/];
        }
    });
}); });
// async () => {scraper.federalIncomeTaxScraper()}
