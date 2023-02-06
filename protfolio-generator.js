/*NdegwaCode*/
import chalk from "chalk";
import yargs from "yargs"
import fs from "fs"
import {createSpinner} from "nanospinner" 
import Currency from "./currency.js";
import TransactionType from "./transaction-type.js";
import Messages from "./messages.js";


export async function getLatestPortfolioValuePerToken(args, targetCurrency = Currency.USD){
    const readStream = fs.createReadStream(args.filePath);

    const latestPortfolioValue = {
        BTC:{amount: 0, timestamp: 0},
        ETH:{amount: 0, timestamp: 0},
        XRP:{amount: 0, timestamp: 0}
    };

    const processTransaction = (transaction) => {
        const token = latestPortfolioValue[transaction.token];
        const transTimestamp = (+transaction.timestamp) * 1000;

        if(isNaN(transTimestamp)){
            throw Error(`timestamp has non numeric value, ${transTimestamp} found`);
        }

        if(args.date){
            const addZeroSuffix = (number) => ((number/10)&0xffffffff) === 0 ? "0"+number : number; 
            let date = new Date(transTimestamp);

            date = `${date.getFullYear()}-${addZeroSuffix(date.getMonth()+1)}-${addZeroSuffix(date.getDate())}`;
            
            if(args.date === date){
                token.amount += transaction.amount * TransactionType[transaction.transaction_type.toLowerCase()];
            }
        }
        else{
            if (transTimestamp >= token.timestamp) {
                token.amount = transaction.amount * TransactionType[transaction.transaction_type.toLowerCase()];
                token.timestamp = transTimestamp;
            }
        }
    }

    startReader(readStream, args, latestPortfolioValue, targetCurrency, processTransaction);
}

function startReader(readStream, args, latestPortfolioValue, targetCurrency, processTransaction) {
    const spinner = createSpinner("processing transactions.csv ...").start();
    let chunkRest = "", linesCount = 0;

    readStream.on("data", (chunk) => {
        const lines = handleChunk(chunkRest + chunk, "\n");
        chunkRest = lines.pop();
        for (let i = 0; i < lines.length; i++) {
            if (i === 0) {
                continue;
            }
            const lineItems = handleChunk(lines[i]);
            processTransaction({ timestamp: lineItems[0], transaction_type: lineItems[1], token: lineItems[2], amount: lineItems[3] });
            linesCount = i;
        }
    }).on("error", (error) => {
        spinner.error({ text: Messages.error(error) });
    }).on("end", async () => {
        const exchange = await getExchange(args);

        if (args.token) {
            spinner.success({ text: Messages.success(args.token, (latestPortfolioValue[args.token].amount * exchange[args.token][targetCurrency]).toFixed(6))});
        } else {
            spinner.success({ text: Messages.success("BTC", (latestPortfolioValue.BTC.amount * exchange.BTC[targetCurrency]).toFixed(6))});
            spinner.success({ text: Messages.success("ETH", (latestPortfolioValue.ETH.amount * exchange.ETH[targetCurrency]).toFixed(6))});
            spinner.success({ text: Messages.success("XRP", (latestPortfolioValue.XRP.amount * exchange.XRP[targetCurrency]).toFixed(6))});
        }
    });
}

/*
    Optimized line parsing to relax the garbage collector
*/
function handleChunk(line, separator = ",") {
    const chunkItems = [];
    for(let start = 0; start !== -1; ){
        start = start === 0 ? start : start + 1
        let end = line.indexOf(separator, start);
        chunkItems.push(line.slice(start, end === -1 ? line.length : end));
        start = end;
    }
    return chunkItems; 
}

export function handleArgs(processArgv){
    return yargs(processArgv)
            .usage(chalk.blue("Usage: portfoliogen ")+chalk.yellow("[option=...]"))
            .options({
                "file-path":{
                    alias:"p", 
                    describe:"Set csv file path to process",
                    coerce: filename=>{
                        const extension = filename.slice(filename.lastIndexOf("."));
                        if(extension !== ".csv"){
                            throw Error(chalk.red(`Invalid file extension:\n\tArgument: file-path, Given: ${filename}, required extension: .csv`));
                        }
                        if(!fs.existsSync(filename)){
                            throw Error(chalk.red(`Invalid file path:\n\tArgument: file-path, Given: ${filename}`));
                        }
                        return filename;
                    }
                },
                "token":{
                    alias:"t", 
                    describe:"Set target token ",
                    choices: ["BTC", "ETH", "XRP"]
                },
                "date":{
                    alias:"d", 
                    describe:"Set target date, date should be in yyyy-mm-dd format",
                    coerce: date=>{
                        date = String(date);
                        const match = Date.parse(date);
                        const error = chalk.red(`Invalid value:\n\tArgument: date, Given: ${date}, format: yyyy-mm-dd`);
                        if(!date.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/) || isNaN(match)){
                            throw Error(error);
                        }
                        return date;
                    }
                }
            })
            .demandOption("file-path",chalk.red("Please provide file-path argument to work with this tool"))
            .showHelpOnFail(true, 'Specify --help for available options')
            .version(false)
            .help()
            .wrap(100)
            .locale("en")
            .argv;
}
