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


var TonWeb = require("tonweb");
import {mnemonicToWalletKey} from "@ton/crypto";
var http = require('http');

var url = require('url');
var fs = require('fs');

var path = require('path');

var baseDirectory = __dirname;

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
    jettonWalletCodeHex: "GEM",
    address: "0:e609c3e241e054e3f078a974e7cd46ea49bcb3e3d8ac4d48c658d27970edb072"});

  const data = await jettonMinter.getJettonData();

  console.log('Total supply:', data.totalSupply.toString());
  console.log('URI to off-chain metadata:', data.jettonContentUri);
  //console.log('Owner address:', data.adminAddress(true, true, true));




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

