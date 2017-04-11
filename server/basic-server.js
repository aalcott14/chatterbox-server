/* Import node's http module: */
var http = require('http');
var qs = require('querystring');
var url = require('url');
var fs = require('fs');
var requestHandler = require('./request-handler');
var handleRequest = requestHandler.requestHandler;
var defaultCorsHeaders = requestHandler.defaultCorsHeaders; 
var serverData = requestHandler.serverData;


var port = 3000;
var ip = '127.0.0.1';
var server = http.createServer(handleRequest);
console.log('Listening on http://' + ip + ':' + port);
server.listen(port, ip);