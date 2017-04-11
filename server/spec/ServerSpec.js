var handler = require('../request-handler');
var expect = require('chai').expect;
var stubs = require('./Stubs');

// Conditional async testing, akin to Jasmine's waitsFor()
// Will wait for test to be truthy before executing callback
var waitForThen = function (test, cb) {
  setTimeout(function() {
    test() ? cb.apply(this) : waitForThen(test, cb);
  }, 5);
};

describe('Node Server Request Listener Function', function() {
  it('Should answer GET requests for /classes/messages with a 200 status code', function() {
    // This is a fake server request. Normally, the server would provide this,
    // but we want to test our function's behavior totally independent of the server code
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    expect(res._ended).to.equal(true);
  });

  it('Should send back parsable stringified JSON', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(JSON.parse.bind(this, res._data)).to.not.throw();
    expect(res._ended).to.equal(true);
  });

  it('Should send back an object', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    var parsedBody = JSON.parse(res._data);
    expect(parsedBody).to.be.an('object');
    expect(res._ended).to.equal(true);
  });

  it('Should send an object containing a `results` array', function() {
    var req = new stubs.request('/classes/messages', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    var parsedBody = JSON.parse(res._data);
    expect(parsedBody).to.have.property('results');
    expect(parsedBody.results).to.be.an('array');
    expect(res._ended).to.equal(true);
  });

  it('Should accept posts to /classes/room', function() {
    var stubMsg = {
      username: 'Jono',
      message: 'Do my bidding!',
      objectId: 1,
      createdAt: 1
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();

    handler.requestHandler(req, res);

    // Expect 201 Created response status
    expect(res._responseCode).to.equal(201);

    // Testing for a newline isn't a valid test
    // TODO: Replace with with a valid test
    // expect(res._data).to.equal(JSON.stringify('\n'));
    expect(res._ended).to.equal(true);
  });

  it('Should respond with messages that were previously posted', function() {
    var stubMsg = {
      username: 'Jono',
      message: 'Do my bidding!',
      objectId: 2,
      createdAt: 2
    };
    var req = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(201);

      // Now if we request the log for that room the message we posted should be there:
    req = new stubs.request('/classes/messages', 'GET');
    res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    var messages = JSON.parse(res._data).results;
    expect(messages.length).to.be.above(0);
    expect(messages[0].username).to.equal('Jono');
    expect(messages[0].message).to.equal('Do my bidding!');
    expect(res._ended).to.equal(true);
  });


  it('Should 404 when asked for a nonexistent file', function() {
    var req = new stubs.request('/arglebargle', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    // Wait for response to return and then check status code
    waitForThen(
      function() { return res._ended; },
      function() {
        expect(res._responseCode).to.equal(404);
      });
  });

  it('Should handle an OPTIONS request', function() {
    var req = new stubs.request('/classes/messages', 'OPTIONS');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    // Expect 200 Created response status
    expect(res._responseCode).to.equal(200);
  });



  it('Should handle query string request', function() {
    var stubMsg = {
      username: 'Jono',
      message: 'Do my bidding!',
      objectId: 3,
      createdAt: 3
    };
    var stubMsg2 = {
      username: 'TIMMI',
      message: 'NEVER!',
      objectId: 4,
      createdAt: 4
    };
    var req1 = new stubs.request('/classes/messages', 'POST', stubMsg);
    var res1 = new stubs.response();
    var req2 = new stubs.request('/classes/messages', 'POST', stubMsg2);
    var res2 = new stubs.response();

    handler.requestHandler(req1, res1);
    handler.requestHandler(req2, res2);

    expect(res1._responseCode).to.equal(201);
    expect(res2._responseCode).to.equal(201);

      // Now if we request the log for that room the message we posted should be there:
    var req = new stubs.request('/classes/messages?order=-createdAt', 'GET');
    var res = new stubs.response();

    handler.requestHandler(req, res);

    expect(res._responseCode).to.equal(200);
    var messages = JSON.parse(res._data).results;
    expect(messages.length).to.be.above(0);
    expect(messages[0].username).to.equal('TIMMI');
    expect(messages[0].message).to.equal('NEVER!');
    expect(res._ended).to.equal(true);
     

    // add TIMMI
    // var req2 = new stubs.request('/classes/messages', 'POST', stubMsg2);
    // var res2 = new stubs.response();

    // handler.requestHandler(req2, res2);

    // expect(res2._responseCode).to.equal(201);

    //   // Now if we request the log for that room the message we posted should be there:
    // req2 = new stubs.request('/classes/messages', 'GET');
    // res2 = new stubs.response();

    // handler.requestHandler(req2, res2);

    // expect(res2._responseCode).to.equal(200);
    // var messages = JSON.parse(res1._data).results;
    // expect(messages.length).to.be.above(0);
    // expect(messages[1].username).to.equal('TIMMI');
    // expect(messages[1].message).to.equal('NEVER!');
    // expect(res2._ended).to.equal(true);
  });

});
