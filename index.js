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


require("dotenv").config();

var insPORT = 8123;

var http = require('http');

var url = require('url');
var fs = require('fs');

var path = require('path');


//tonChain = require("./chains/ton/main.js");
hbarChain = require("./chains/hbar/main.js");


var baseDirectory = __dirname;


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
	    //do swap
	    var address = getBitsWinOpt(request.url,'address');
	    response.setHeader('Access-Control-Allow-Origin', '*');
	    //response.setHeader('content-type', 'application/json');
	    
	    console.log(address);
	    var r = await tonChain.doSton(address);
	    
	    console.log(r);
	    
	    response.end(JSON.stringify(r));
	    return
	    
	}
     
	
	if(request.url.includes('/doburn/')){
	    //do burn
	    var address = getBitsWinOpt(request.url,'address');
	    var contract = getBitsWinOpt(request.url,'contract');
	    response.setHeader('Access-Control-Allow-Origin', '*');
	    //response.setHeader('content-type', 'application/json');
	    
	    console.log(address);
	    var r = await tonChain.doBurn(contract, address, 10);
	    //var r = await doTransfer(rubsParentWallet, 10);
	    
	    console.log(r);
	    
	    response.end(JSON.stringify(r));
	    return
	    
	}
	
	if(request.url.includes('/domint/')){
	     
	     
	     
	     
	     
	     
	     
        
        
        
    // TO-DO
    // do actual mint instead of storing funds in admin wallet
	    
	    var address = getBitsWinOpt(request.url,'address');
	    response.setHeader('Access-Control-Allow-Origin', '*');
	    //response.setHeader('content-type', 'application/json');
	    
	    console.log(address);
	    var r = await tonChain.doMint(address, 1);
	    await tonChain.doSendTran(r);
	    console.log(r);
	    
	    response.end(JSON.stringify(r));
	    return
	    
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

