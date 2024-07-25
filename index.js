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
