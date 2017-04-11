var qs = require('querystring');
var url = require('url');
var fs = require('fs');

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10
};

var serverData = [];

var requestHandler = function(request, response) {
  console.log('----------->Serving request type ' + request.method + ' for url ' + request.url);

  var pathName = url.parse(request.url).pathname;
  var query = url.parse(request.url).query;
  var statusCode;
  var body;
  var headers = defaultCorsHeaders;
  
  if (pathName !== '/classes/messages') {
    statusCode = 404;
  } else if (request.method === 'OPTIONS') {
    statusCode = 200;
    headers['OPTIONS'] = 'GET, POST, PUT, DELETE, OPTIONS'; 
  } else if (request.method === 'GET') {
    statusCode = 200;
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
  headers['Content-Type'] = 'application/json';

  response.writeHead(statusCode, headers);

  response.end(JSON.stringify({results: serverData}));

};  

exports.requestHandler = requestHandler;
exports.defaultCorsHeaders = defaultCorsHeaders;
exports.serverData = serverData;

