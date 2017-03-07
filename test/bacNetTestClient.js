var dgram = require('dgram');

var SERVER_HOST = '127.0.0.1';
var SERVER_PORT = 33333;

var CLIENT_HOST = '127.0.0.1';
var CLIENT_PORT = 48651;

var q = require('q');
var _ = require('underscore');

/**
 *
 * @constructor
 */
function Adapter() {
}

/**
 * @param host
 * @param port
 */
Adapter.prototype.initialize = function () {
    console.log('adapter initialize');
    this.TIMEOUT = 10000;
    this.udpServer = dgram.createSocket('udp4');
    this.udpClient = dgram.createSocket('udp4');

    this.requests = [];
    this.listeners = [];

    this.udpServer.on('listening', function () {
        var address = this.udpServer.address();

        console.log('UDP Server listening on ' + address.address + ":" + address.port);
    }.bind(this));

    this.udpServer.on('message', function (message, remote) {
        console.log(remote.address + ':' + remote.port + ' - ' + message);

        //check out message
        console.log(message);
        console.log(Buffer.isBuffer(message));
        console.log(Buffer.isEncoding('utf-8'))

        //encodings
        //console.log(message.toString('hex'));
        //console.log(message.toString('ascii'));
        //console.log(message.toString('base64'));

        //buffer -> string -> JSON
        var messageBody = message.toString('utf-8');
        console.log(messageBody); //utf-8 is the default

        var messageJSON = JSON.parse(messageBody);
        console.log(messageJSON);

        //building response
        messageJSON.response = 'me too';
        responseBody = JSON.stringify(messageJSON);
        console.log(responseBody);

        //sending response
        this.udpServer.send(responseBody, 0, responseBody.length, CLIENT_PORT, CLIENT_HOST, function (err, bytes) {
            if (err) {
                throw err;
            }

            console.log('UDP Server message sent to ' + CLIENT_HOST + ':' + CLIENT_PORT);
        }.bind(this));

        //for (var n in this.listeners) {
            //if (this.listeners[n] ...) {
                //TODO Some unmarshalling can happen here

            //    this.listeners.callback(message);
            //}
        //}
    }.bind(this));

    this.udpServer.bind(SERVER_PORT, SERVER_HOST);
    this.udpClient.bind(CLIENT_PORT, CLIENT_HOST);
};

/**
 * Generic request send
 *
 * @param request
 * @returns {*}
 */
Adapter.prototype.sendRequest = function (request) {
    console.log('adapter send request');
    var deferred = q.defer();

    this.requests.push(request);

    request.deferred = deferred;
    request.adapter = this;

    this.udpClient.send(request.messageBody, 0, request.messageBody.length, SERVER_PORT, SERVER_HOST, function (err, bytes) {
        if (err) {
            this.adapter.requests = _.without(this.adapter.requests, this);

            throw err;
        }

        request.startWaiting(this.TIMEOUT);

        console.log('UDP Client message sent to ' + SERVER_HOST + ':' + SERVER_PORT);
    }.bind(this));

    return deferred.promise;
};

/**
 *
 * @returns {*}
 */
Adapter.prototype.sendXRequest = function () {
    console.log('adapter send x request');
    //var request = new Request().initialize();
    var request = new Request();
    request.message = 'i like tea';

    // TODO Some X-specific marshalling happens here

    var body = {
        time: request.time,
        message: request.message
    };

    console.log(body);

    request.messageBody = JSON.stringify(body);

    console.log(request.messageBody);

    return this.sendRequest(request);
};

/**
 *
 * @returns {*}
 */
Adapter.prototype.sendYRequest = function (message) {
    console.log('adapter send y request');
    //var request = new Request().initialize();
    var request = new Request().initialize();
    request.message = message;

    // TODO Some Y-specific marshalling happens here

    return this.sendRequest(request);
};

/**
 *
 * @constructor
 */
function Request() {
    var d = new Date();
    this.time = d.getTime();
}

/**
 *
 * @param adapter
 * @param deferred
 */
Request.prototype.initialize = function () {
};

/**
 *
 * @param message
 */
Request.prototype.startWaiting = function (timeout) {
    console.log('request start waiting');
    /*
    this.adapter.udpClient.on('listening', function () {
        var address = this.udpClient.address();

        console.log('UDP Client listening on ' + address.address + ":" + address.port);
    }.bind(this));
    */

    this.adapter.udpClient.on('message', function (message, remote) {
        console.log(remote.address + ':' + remote.port + ' - ' + message);

        //buffer -> string -> JSON
        var messageBody = message.toString('utf-8');
        console.log(messageBody); //utf-8 is the default

        var messageJSON = JSON.parse(messageBody);
        console.log(messageJSON);

        //matching back request
        console.log('try matching message');
        var matchingRequest = _.find(this.adapter.requests, {time: messageJSON.time});

        if (matchingRequest) {
            console.log(messageJSON.response);
            matchingRequest.resolve(message);
        }
    }.bind(this));

    this.timeout = setTimeout(function () {
        //Remove request
        this.adapter.requests = _.without(this.adapter.requests, this);
        this.adapter.udpClient.close();
        this.deferred.reject('Got a big timeout.');
    }.bind(this), timeout);
};

/**
 *
 * @param message
 */
Request.prototype.resolve = function (message) {
    console.log('request resolve');
    clearTimeout(this.timeout);
    this.adapter.requests = _.without(this.adapter.requests, this);
    this.adapter.udpClient.close();
    this.adapter.udpServer.close();
    this.deferred.resolve(message);
};

//TEST

var testAdapter = new Adapter();
testAdapter.initialize(SERVER_HOST,SERVER_PORT);

testAdapter.sendXRequest();