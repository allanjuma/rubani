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


var baseDirectory = __dirname;

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





















/*
const TonWeb = require("tonweb");
const utils = require("tonweb/src/utils");
const NftUtils = require("tonweb/src/contract/token/nft/NftUtils");
const Cell = TonWeb.boc.Cell;
const { JettonMinter, JettonWallet } = TonWeb.token.jetton;
const jettonContentUri = 'https://rubani.bitsoko.org/jettonContentURI.json';

async function doit() {
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', { apiKey: "22137c0e80f8524bedc10e31fcf4a73a0d4515d37fd96f6972053b54c76ab834" }));
    const WalletClass = tonweb.wallet.all['v3R2'];
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
        data.ownerAddress =
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

