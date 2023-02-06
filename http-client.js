import {config} from "dotenv"
import fetch from "node-fetch";

export class HttpClient {   

    constructor(){
        config();
    }

    async getTokensExchange(tokens, targetCurrency){
        let exchange = null; 
        if(tokens && tokens instanceof Array){
            exchange = await fetch(todayExchangeUrl(tokens.join(),targetCurrency),{
                headers:{
                    authorization: `Apikey ${process.env.API_KEY}`
                }
            }).then(repsonse => repsonse.json())
            .catch(reason=>{
                throw Error(reason);
            });
        }
        return exchange;
    }

    async getTokenExchangeOnTimestamp(token, timestamp, targetCurrency){
        let exchange = null; 
        if(token){
            exchange = await fetch(timestampExchangeUrl(token, targetCurrency, timestamp),{
                headers:{
                    authorization: `Apikey ${process.env.API_KEY}`
                }
            }).then(repsonse => repsonse.json())
            .catch(reason=>{
                throw Error(reason);
            });
        }
        return exchange;
    }

}

function todayExchangeUrl(tokens, targetCurrency){
    return `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tokens}&tsyms=${targetCurrency}`;
}

function timestampExchangeUrl(token, targetCurrency, timestamp){
    return `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${token}&tsyms=${targetCurrency}&ts=${timestamp}`;
}