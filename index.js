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


/*
 import { GameFi } from '@ton/phaser-sdk@beta'
// creation options described in the related section
const gameFi = await GameFi.create()





function onWalletChange(wallet) {
    if (wallet) {
        // wallet is ready to use
    } else {
        // wallet is disconnected
    }
}
const unsubscribe = gameFi.onWalletChange(onWalletChange)




const gameFi = await GameFi.create({
    network: 'testnet'
    connector: {
        // if tonconnect-manifest.json is placed in the root you can skip this option
        manifestUrl: 'tonconnect-manifest.json',
        actionsConfiguration: {
            // address of your Telegram Mini App to return to after the wallet is connected
            // url you provided to BothFather during the app creation process
            // to read more please read https://github.com/ton-community/flappy-bird#telegram-bot--telegram-web-app
            twaReturnUrl: "https://t.me/rubani_bot"
        },
        contentResolver: {
            // some NFT marketplaces don't support CORS, so we need to use a proxy
            // you are able to use any format of the URL, %URL% will be replaced with the actual URL
            //urlProxy: `${YOUR_BACKEND_URL}/${PROXY_URL}?url=%URL%`
        },
        // where in-game purchases come to
        merchant: {
            // in-game jetton purchases (FLAP)
            // use address you got running `assets-cli deploy-jetton`
            jettonAddress: "kQC2dIk7SZR7CXT_xFISznRyUEK4-uHPri43KGmZTPICCd5-",
            // in-game TON purchases
            // use master wallet address you got running `assets-cli setup-env`
            tonAddress: "kQAIyQCZPGdzcPQoaqqs47_Y8WJadR9ARKr4aajnSA1lo1vv"
        }
    },

});
*/

/*

class UiScene extends Phaser.Scene {
    // receive gameFi instance via constructor
    private gameFi: GameFi;

    create() {
        this.button = this.gameFi.createConnectButton({
            scene: this,
            // you can calculate the position for the button in your UI scene
            x: 0,
            y: 0,
            button: {
                onError: (error) => {
                    console.error(error)
                }
                // other options, read the docs
            }
        })
    }
}



function onWalletChange(wallet: Wallet | null) {
    if (wallet) {
        // wallet is ready to use
    } else {
        // wallet is disconnected
    }
}
const unsubscribe = gameFi.onWalletChange(onWalletChange)



*/

/*
import AssetsSDK from "@ton-community/assets-sdk";
import PinataStorageParams from "@ton-community/assets-sdk";
import createApi from "@ton-community/assets-sdk";
import createSender from "@ton-community/assets-sdk";
import createWalletV4 from "@ton-community/assets-sdk";
import importKey from "@ton-community/assets-sdk";

// create an instance of the TonClient4
const NETWORK = 'testnet';
const api = await createApi(NETWORK);

// create a sender from the wallet (in this case, Highload Wallet V2)
const keyPair = await importKey(process.env.MNEMONIC);
const sender = await createSender('highload-v2', keyPair, api);

// define the storage parameters (in this case, Pinata)
const storage = {
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretKey: process.env.PINATA_SECRET,
}

// create the SDK instance
const sdk = AssetsSDK.create({
    api: api,          // required, the TonClient4 instance
    storage: storage,  // optional, the storage instance (Pinata, S3 or your own)
    sender: sender,    // optional, the sender instance (WalletV4, TonConnect or your own)
});

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
