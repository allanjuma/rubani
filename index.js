 ['log', 'warn', 'error'].forEach((methodName) => {
  const originalMethod = console[methodName];
  console[methodName] = (...args) => {
    let initiator = 'unknown place';
    try {
      throw new Error();
    } catch (e) {
      if (typeof e.stack === 'string') {
        let isFirst = true;
        for (const line of e.stack.split('\n')) {
          const matches = line.match(/^\s+at\s+(.*)/);
          if (matches) {
            if (!isFirst) { // first line - current function
                            // second line - caller (what we are looking for)
              initiator = matches[1];
              break;
            }
            isFirst = false;
          }
        }
      }
    }
    originalMethod.apply(console, [...args, '\n', `  at ${initiator}`]);
  };
});


console.log('starting rubani');

var insPORT = 8123;
//import {TonWeb} from "tonweb";
//import {mnemonicToWalletKey} from "@ton/crypto";
import {TonConnect} from '@tonconnect/sdk'
import {TonConnectUI} from '@tonconnect/ui'
import {GameFiSDK, createWalletV4} from "@ton-community/gamefi-sdk";
import {beginCell, toNano, Address, TonClient } from "@ton/ton";
import { DEX, pTON } from "@ston-fi/sdk";



const client = new TonClient({
  endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  apiKey: "22137c0e80f8524bedc10e31fcf4a73a0d4515d37fd96f6972053b54c76ab834"
  
});

const router = client.open(new DEX.v1.Router());
/*
// swap 1 TON to STON but not less than 1 nano STON
const txParams = await router.getSwapTonToJettonTxParams({
  userWalletAddress: "", // ! replace with your address
  proxyTon: new pTON.v1(),
  offerAmount: toNano("1"),
  askJettonAddress: "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO", // STON
  minAskAmount: "1",
  queryId: 12345,
});


*/
const tonSwap = async () => {
        const txParams = await dex.getSwapTonToJettonTxParams({
          offerAmount: toNano("1"), // swap 1 TON
          askJettonAddress: "EQA2kCVNwVsil2EM2mB0SkXytxCqQjS4mttjDpnXmwG9T6bO", // for a STON
          minAskAmount: toNano("0.1"), // but not less than 0.1 STON
          proxyTon: new pTON.v1(),
          //userWalletAddress: wallet,
        });
        
        console.log(txParams);

        /*
        var tran = await tonConnectUI.sendTransaction({
          validUntil: Date.now() + 1000000,
          messages: [
            {
              address: txParams.to.toString(),
              amount: txParams.value.toString(),
              payload: txParams.body?.toBoc().toString("base64"),
            },
          ],
        });
        
        console.log(tran);
        */
      };

//tonSwap();




import {ApiTokenAddress, RoutingApi} from "@swap-coffee/sdk";

//const connector = await setupTonConnect()
const routingApi = new RoutingApi()

const assetIn: ApiTokenAddress = {
    blockchain: "ton",
    address: "native" // stands for TON
}
const assetOut: ApiTokenAddress = {
    blockchain: "ton",
    address: "EQCl0S4xvoeGeFGijTzicSA8j6GiiugmJW5zxQbZTUntre-1" // CES
}

const input_amount = 5 // 5 TON

// let's build an optimal route
const route = await routingApi.buildRoute({
    input_token: assetIn,
    output_token: assetOut,
    input_amount: input_amount,
})
console.log(route);
// then we can build transactions payload
const transactions = await routingApi.buildTransactionsV2({
    sender_address: connector.account?.address!!, // address of user's wallet
    slippage: 0.1, // 10% slippage
    paths: route.data.paths,
})

let messages = []

for (const transaction of transactions.data.transactions) {
    // swap.coffee takes care of all the boring stuff here :)
    messages.push({
        address: transaction.address,
        amount: transaction.value,
        payload: transaction.cell,
    })
}

console.log(route);


/*


console.log(process.env.MNEMONIC);
const wallet = await createWalletV4('duty mistake ready edge wool toss know reject extend state judge grit empower rifle phrase raise spring easily census picture pen sibling traffic absent');

const sdk = await GameFiSDK.create({
    storage: {
        pinataApiKey: "90cdf115e5e86ba8ab81",
        pinataSecretKey: "7e94dda9d9998778b2a7168142ab40ad9bed09e43e4e28b366d9bf7cd4dd0ab3",
    },
    api: 'testnet',
    wallet: wallet
});
const jetton = sdk.openJetton(Address.parse('kQC2dIk7SZR7CXT_xFISznRyUEK4-uHPri43KGmZTPICCd5-'));
console.log(jetton);
//jetton.sendMint(1);

//console.log(await jetton.getWalletAddress());
//console.log(await jetton.getData());
const collection = sdk.openNftCollection(Address.parse('kQC_rOamfRYkFYnHsH5Cw5wS-38Kht-_5fT1GuaPYv4HDB44'));
console.log(collection);
//collection.sendMint();




    const body = beginCell()
        .storeUint(0xf8a7ea5, 32)                 // jetton transfer op code
        .storeUint(0, 64)                         // query_id:uint64
        .storeCoins(1000000)                      // amount:(VarUInteger 16) -  Jetton amount for transfer (decimals = 6 - jUSDT, 9 - default)
        .storeAddress(Address.parse('0QAIyQCZPGdzcPQoaqqs47_Y8WJadR9ARKr4aajnSA1lowYq'))  // destination:MsgAddress
        .storeAddress(Address.parse('0QAIyQCZPGdzcPQoaqqs47_Y8WJadR9ARKr4aajnSA1lowYq'))  // response_destination:MsgAddress
        .storeUint(0, 1)                          // custom_payload:(Maybe ^Cell)
        .storeCoins(toNano(0.05))                 // forward_ton_amount:(VarUInteger 16) - if >0, will send notification message
        .storeUint(0,1)                           // forward_payload:(Either Cell ^Cell)
        .endCell();
        
        
        const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 360,
    messages: [
        {
            address: Address.parse('kQC2dIk7SZR7CXT_xFISznRyUEK4-uHPri43KGmZTPICCd5-'),  // sender jetton wallet
            amount: toNano(0.05).toString(),         // for commission fees, excess will be returned
            payload: body.toBoc().toString("base64") // payload with jetton transfer body
        }
    ]
}

//const result = connector.sendTransaction(transaction)
  */
  
  
  /*
console.log(process.env.MNEMONIC);
const mnemonic = "duty mistake ready edge wool toss know reject extend state judge grit empower rifle phrase raise spring easily census picture pen sibling traffic absent";
  
  tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: 'YOUR_TESTNET_TONCENTER_API_KEY'}));


const keyPair = await mnemonicToWalletKey(mnemonic.split(" "));

  const WalletClass = tonweb.wallet.all.v4R2;

  const wallet = new WalletClass(tonweb.provider, {
    publicKey: keyPair.publicKey
  });

  const address = await wallet.getAddress();

  console.log("my address", address.toString());

  const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonweb.provider, {
    adminAddress: address,
    jettonContentUri: "",
    jettonWalletCodeHex: "RUBS",
    address: Address.parse('0QAIyQCZPGdzcPQoaqqs47_Y8WJadR9ARKr4aajnSA1lowYq')});

  const data = await jettonMinter.getJettonData();

  console.log('Total supply:', data.totalSupply.toString());
  console.log('URI to off-chain metadata:', data.jettonContentUri);
  //console.log('Owner address:', data.adminAddress(true, true, true));

  const jettonWalletAddress = await jettonMinter.getJettonWalletAddress(address);

  console.log("jetton wallet address", jettonWalletAddress.toString())
*/



import * as http from 'http';
/*

var http = require('http');

var url = require('url');
var fs = require('fs');

var path = require('path');

var baseDirectory = __dirname;





http.createServer(async function (request, response) {
    try {
        console.log(request.url);
        
        if(request.url == '/'){
           request.url = '/index.html';
        }
     
        var requestUrl = url.parse(request.url);

        // need to use path.normalize so people can't access directories underneath baseDirectory
        var fsPath = baseDirectory+path.normalize(requestUrl.pathname);

        var fileStream = fs.createReadStream(fsPath);
        
        fileStream.pipe(response);
        
        fileStream.on('open', function() {
             response.writeHead(200)
        });
        
        fileStream.on('error',function(e) {
             response.writeHead(404)     // assume the file doesn't exist
             response.end()
        });
 


   } catch(e) {
        response.writeHead(500);
        response.end();     // end the response so browsers don't hang
        console.log(e.stack);
   }
}).listen(insPORT, async function(err) {
  if (err) throw err;

console.log("listening on port "+insPORT);


});


*/

import url from 'url';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const baseDirectory = __dirname;

http.createServer(async (request, response) => {
    try {
        console.log(request.url);
        
        if (request.url === '/') {
            request.url = '/index.html';
        }


	
	if(request.url.includes('/tonconnect-manifest.json')){
	    
	    response.setHeader('content-type', 'application/json'); 
	    
	    
	}
        const requestUrl = url.parse(request.url);

        // Use path.normalize to prevent directory traversal
        const fsPath = path.join(baseDirectory, path.normalize(requestUrl.pathname));

        const fileStream = fs.createReadStream(fsPath);
        
        fileStream.pipe(response);
        
        fileStream.on('open', () => {
            response.writeHead(200);
        });
        
        fileStream.on('error', () => {
            response.writeHead(404); // Assume the file doesn't exist
            response.end();
        });
    } catch (e) {
        response.writeHead(500);
        response.end(); // End the response so browsers don't hang
        console.error(e.stack);
    }
}).listen(insPORT, async (err) => {
    if (err) throw err;

    console.log(`Listening on port ${insPORT}`);
});
