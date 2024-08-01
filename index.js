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
            if(!isFirst) { 
                
                // first line - current function
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

var http = require('http');

var url = require('url');
var fs = require('fs');

var path = require('path');
var swap = require('@swap-coffee/sdk');
var ston = require('@ston-fi/sdk');

var ton = require('@ton/ton');
//import { Cell, beginCell, Address, beginDict, Slice, toNano } from "ton";

const TonWeb = require("tonweb");
var baseDirectory = __dirname;


const client = new ton.TonClient({
  endpoint: "https://toncenter.com/api/v2/jsonRPC",
});

const dex = client.open(new ston.DEX.v1.Router());


        rubsParentWallet = "0QA_FaPINkfLXs_KY0O9Sw_GkAiY8QthpAqyYIzjhW03a4cg";
        rubsContractAddress = "kQAGL6r5BaATeS5r0NuvMgzC5H2cdrzwcMIcZieMJW7hszbB";





const OPS = {
  ChangeAdmin: 3,
  ReplaceMetadata: 4,
  Mint: 21,
  InternalTransfer: 0x178d4519,
  Transfer: 0xf8a7ea5,
  Burn: 0x595f07bc,
};

const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', { apiKey: "22137c0e80f8524bedc10e31fcf4a73a0d4515d37fd96f6972053b54c76ab834" }));
    const WalletClass = tonweb.wallet.all['v3R2'];
    
const seed = TonWeb.utils.base64ToBytes(bytes);
const mnemonic = "duty mistake ready edge wool toss know reject extend state judge grit empower rifle phrase raise spring easily census picture pen sibling traffic absent";
 

const keyPair = await TonWeb.mnemonic.mnemonicToKeyPair(mnemonic.split(" "));


        //const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);
        const wallet = new WalletClass(tonweb.provider, {
            publicKey: keyPair.publicKey,
        });
        const address = await wallet.getAddress();
        const balance = await tonweb.getBalance(admin.address);
        console.log({ keyPair, wallet, address, balance});
        
        
        
        
        
        
        
        
        
        
        

async function doSton(address){
        const txParams = await dex.getSwapTonToJettonTxParams({
          offerAmount: ton.toNano("1"), // swap 1 TON
          askJettonAddress: rubsContractAddress, // for a RUBS
          minAskAmount: ton.toNano("10"), // but not less than 0.1 RUBS
          proxyTon: new ston.pTON.v1(),
          userWalletAddress: address,
        });

       
       return {
          validUntil: Date.now() + 1000000,
          messages: [
            {
              address: txParams.to.toString(),
              amount: txParams.value.toString(),
              payload: txParams.body?.toBoc().toString('base64'),
            },
          ],
        };
      
         /*
       return '{
              "address": txParams.to.toString(),
              "amount": txParams.value.toString(),
              "payload": txParams.body?.toBoc().toString(base64")
    
}';
         */ 
      }
      

/*
console.log(ston.DEX, ston.pTON);
console.log(new swap.ApiTokenAddress);

const routingApi = new swap.RoutingApi();


//const connector = await setupTonConnect()

const assetIn = new swap.ApiTokenAddress({
    blockchain: "ton",
    address: "native" // stands for TON
})

const assetOut = new ApiTokenAddress({
    blockchain: "ton",
    address: "EQCl0S4xvoeGeFGijTzicSA8j6GiiugmJW5zxQbZTUntre-1" // CES
})

const input_amount = 5; // 5 TON

// let's build an optimal route
const route = routingApi.buildRoute({
    input_token: assetIn,
    output_token: assetOut,
    input_amount: input_amount,
})
console.log(route);
// then we can build transactions payload
const transactions = routingApi.buildTransactionsV2({
    sender_address: '0QAIyQCZPGdzcPQoaqqs47_Y8WJadR9ARKr4aajnSA1lowYq', // address of user's wallet
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



*/

















/*
const TonWeb = require("tonweb");
const utils = require("tonweb/src/utils");
const NftUtils = require("tonweb/src/contract/token/nft/NftUtils");
const Cell = TonWeb.boc.Cell;
const { JettonMinter, JettonWallet } = TonWeb.token.jetton;
const jettonContentUri = 'https://rubani.bitsoko.org/jettonContentURI.json';

async function doit() {
    async function tonWalletFromBase64(bytes) {
        const seed = TonWeb.utils.base64ToBytes(bytes);
        const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);
        const wallet = new WalletClass(tonweb.provider, {
            publicKey: keyPair.publicKey,
        });
        const address = await wallet.getAddress();
        const logBalance = async (suffix = "") => {
            const balance = await tonweb.getBalance(admin.address);
            console.log(suffix + " address", admin.address.toString(true, true, true));
            console.log(suffix + " balance", balance);
        };
        return { keyPair, wallet, address, logBalance };
    }
    const admin = await tonWalletFromBase64('vt78J2v6FaSuXFGcyGtqT5elpVxcZ+I1zgu/GUfA5uY=');
    const bank = await tonWalletFromBase64('vt73J2v6FaSuXFGcyGtqT5elpVxcZ+I1zgu/GUfA5uY=');
    const minter = new JettonMinter(tonweb.provider, {
        adminAddress: admin.address,
        jettonContentUri,
        jettonWalletCodeHex: JettonWallet.codeHex
    });
    const minterAddress = await minter.getAddress();
    console.log("адрес тон-кошелька админа:", admin.address.toString(true, true, true));
    console.log("адрес минтера:", minterAddress.toString(true, true, true));

    async function createJetton() {
        const deployMinter = async () => {
            const seqno = (await admin.wallet.methods.seqno().call()) || 0;
            console.log(await admin.wallet.methods.transfer({
                secretKey: admin.keyPair.secretKey,
                toAddress: minterAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano(0.05),
                seqno,
                payload: null,
                sendMode: 3,
                stateInit: (await minter.createStateInit()).stateInit
            }).send());
        };
        // await deployMinter()
        const mint = async () => {
            const seqno = (await admin.wallet.methods.seqno().call()) || 0;
            console.log(await admin.wallet.methods.transfer({
                secretKey: admin.keyPair.secretKey,
                toAddress: minterAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano('0.5'),
                seqno: seqno,
                payload: await minter.createMintBody({
                    jettonAmount: TonWeb.utils.toNano(721),
                    destination: admin.address,
                    amount: TonWeb.utils.toNano('0.04')
                }),
                sendMode: 3,
            }).send());
        };
        await mint()
        const getMinterInfo = async () => {
            const data = await minter.getJettonData();
            data.totalSupply = data.totalSupply.toString();
            data.adminAddress = data.adminAddress.toString(true, true, true);
            console.log("MinterInfo.totalSupply:", data.totalSupply);
        };
        await getMinterInfo();
    }



    // await createJetton()

    // return

    async function toJettonWallet(ownerAddress) {
        const cell = new Cell();
        cell.bits.writeAddress(ownerAddress);
        const result = await tonweb.provider.call2(minterAddress.toString(), 'get_wallet_address', [['tvm.Slice', (0, utils.bytesToBase64)(await cell.toBoc(false))]]);
        const address = (0, NftUtils.parseAddress)(result);
        return new JettonWallet(tonweb.provider, {
            address
        });
    }
    const checkJettonBalance = async (jettonWallet) => {
        console.log(":: проверка жетон-баланса жетон-кошелька:", jettonWallet.address.toString(true, true, true));
        const data = await jettonWallet.getData();
        data.ownerAddress = "";
        data.jettonMinterAddress = data.jettonMinterAddress.toString(true, true, true);
        console.log(":: жетон-баланс:", data.balance.toString());
        // console.log(":: ownerAddress       :", data.ownerAddress.toString(true, true, true));
        // console.log(":: jettonMinterAddress:", data.jettonMinterAddress.toString(true, true, true));
    };

    const bankJW = await toJettonWallet(bank.address)
    console.log("bank", bank.address.toString(true, true, true))
    console.log("bankJW", bankJW.address.toString(true, true, true))
    await checkJettonBalance(bankJW);
    const transfer = async (targetTonAddres) => {
        const seqno = (await bank.wallet.methods.seqno().call()) || 0;
        console.log("перевод жетона")
        console.log(await bank.wallet.methods.transfer({
            secretKey: bank.keyPair.secretKey,
            toAddress: bankJW.address,
            amount: TonWeb.utils.toNano(0.4),
            seqno,
            payload: await bankJW.createTransferBody({
                jettonAmount: TonWeb.utils.toNano('1'),
                toAddress: targetTonAddres,
                forwardAmount: TonWeb.utils.toNano(0.1),
                forwardPayload: new TextEncoder().encode('gift'),
                responseAddress: bank.address
            }),
            sendMode: 3,
        }).send());
    };


    const newWallet = await tonWalletFromBase64('vt51J2v6FaSuXFGcyGtqT5elpVxcZ+I1zgu/GUfA5uY=');
    console.log("new wallet address", newWallet.address.toString(true, true, true));
    await transfer(newWallet.address)

    const newJettonWallet = await toJettonWallet(newWallet.address);
    console.log("jetton wallet address", newJettonWallet.address.toString(true, true, true));

    console.log("send 15 сек")
    await new Promise(done=>setTimeout(done, 15000))
    await checkJettonBalance(bankJW);
    await checkJettonBalance(newJettonWallet);
}


doit();


*/

  function getBitsWinOpt(str,aKey){    
			try{    
		   var ps=str.split("?")[1];
 var pairs = ps.split("&");
            }catch(e){
return false;
}  
  		     
            
for(var i = 0, aKey=aKey; i < pairs.length; ++i) {
var key=pairs[i].split("=")[0];
	
    var value=pairs[i].split("=")[1];
 if (key==aKey){
     
     return value;
 
 }  
    
}
		     }


function mintBody(
  owner,
  jettonValue,
  transferToJWallet,
  queryId
){
  return ton.beginCell()
    .storeUint(OPS.Mint, 32)
    .storeUint(queryId, 64) // queryid
    .storeAddress(owner)
    .storeCoins(transferToJWallet)
    .storeRef(
      // internal transfer message
      ton.beginCell()
        .storeUint(OPS.InternalTransfer, 32)
        .storeUint(0, 64)
        .storeCoins(jettonValue)
        .storeAddress(null)
        .storeAddress(owner)
        .storeCoins(ton.toNano(0.001))
        .storeBit(false) // forward_payload in this slice, not separate cell
        .endCell(),
    )
    .endCell();
}




function doMint(address, amount){
    
    return {
      validUntil: Date.now() + 5 * 60 * 1000,
      messages: [
        {
          address: "kQAGL6r5BaATeS5r0NuvMgzC5H2cdrzwcMIcZieMJW7hszbB",
          amount: ton.toNano(0.04).toString(),
          stateInit: undefined,
          payload: mintBody(ton.Address.parse(address), amount, ton.toNano(0.02), 0)
            .toBoc()
            .toString("base64"),
        },
      ],
    };
    
}

http.createServer(async function (request, response) {
    try {
        console.log(request.url);
        
        if(request.url == '/'){
           request.url = '/index.html';
        }
     
	
	if(request.url.includes('/tonconnect-manifest.json')){
	    
	    response.setHeader('content-type', 'application/json'); 
	    
	    
	}
     
	
	if(request.url.includes('/doswap/')){
	    
	    var address = getBitsWinOpt(request.url,'address');
	    response.setHeader('Access-Control-Allow-Origin', '*');
	    //response.setHeader('content-type', 'application/json');
	    
	    console.log(address);
	    var r = await doSton(address);
	    
	    console.log(r);
	    
	    response.end(JSON.stringify(r));
	    
	    
	}
	
	if(request.url.includes('/domint/')){
	    
	    var address = getBitsWinOpt(request.url,'address');
	    response.setHeader('Access-Control-Allow-Origin', '*');
	    //response.setHeader('content-type', 'application/json');
	    
	    console.log(address);
	    var r = await doMint(address, 1);
	    await wallet.methods.transfer(r).send();
	    console.log(r);
	    
	    response.end(JSON.stringify(r));
	    
	    
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

