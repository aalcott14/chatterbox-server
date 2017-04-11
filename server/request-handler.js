/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var fs = require('fs');
var qs = require('querystring');
var url = require('url');

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

// var serverData = [{
//   objectId: 'SDGNOA',
//   username: 'tim',
//   text: 'Hi, Im Tim',
//   roomname: 'hackreactor',
//   createdAt: Date.now()
// }];
var serverData = [];

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('----------->Serving request type ' + request.method + ' for url ' + request.url);
  var pathName = url.parse(request.url).pathname;
  var query = url.parse(request.url).query;
  
  // The outgoing status.
  var statusCode;
  var body;
  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;
  
  if (pathName !== '/classes/messages') {
    statusCode = 404;
  } else if (request.method === 'OPTIONS') {
    statusCode = 200;
    headers['OPTIONS'] = 'GET, POST, PUT, DELETE, OPTIONS'; 

  } else if (request.method === 'GET') {
    statusCode = 200;
    console.log('IN GET REQUEST');
    if (query !== null) {
      var objectQuery = qs.parse(query);
      serverData.sort(function(a, b) {
        if (objectQuery.order.charAt(0) === '-') {
          return b.createdAt - a.createdAt;
        } else {
          return a.createdAt - b.createdAt;
        }
      });
    }
    // headers['Content-Type'] = 'application/json';
    // response.writeHead(statusCode, headers);
    // response.end(JSON.stringify({results: serverData}));
  } else if (request.method === 'POST') {
    statusCode = 201;
    body = '';
    request.on('data', function(data) {
      body += data;
      serverData.push(JSON.parse(body));
    });
    request.on('end', function() {
      body = JSON.stringify({results: serverData});
      response.end(body);
    });
  }


  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = 'application/json';

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //

  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  response.end(JSON.stringify({results: serverData}));

};



// JSON.parse(res._data).results

exports.requestHandler = requestHandler;
exports.defaultCorsHeaders = defaultCorsHeaders;
exports.serverData = serverData;

