/*
var PORT = 33333;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function () {
    var address = server.address();
    console.log('UDP Server listening on ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);

});

server.bind(PORT, HOST);
*/

var dgram = require('dgram');
var q = require('q');
var _ = require('underscore');

/**
 *
 * @constructor
 */
function BACnetTestController() {
}

/**
 * @param host
 * @param port
 */
BACnetTestController.prototype.initialize = function (port, host) {
    console.log('test controller initialize');
    this.udpServer = dgram.createSocket('udp4');

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
        var responseBody = '';

        if (messageJSON.type == 'R') {
            console.log('responding request logic')
            messageJSON.response = 'me too';
        } else if (messageJSON.type == 'L') {
            console.log('try matching listener');
            var matchingListener = _.find(this.listeners, {resource: messageJSON.resource});

            if (matchingListener) {
                if (messageJSON.action == 'link') {
                    console.log('listener ' + messageJSON.resource + ' already exists');
                    delete messageJSON.action;
                    messageJSON.status = 2;
                } else if (messageJSON.action == 'unlink') {
                    console.log('listener ' + messageJSON.resource + ' unregistered');
                    this.listeners = _.without(this.listeners, matchingListener);
                    delete messageJSON.action;
                    messageJSON.status = 1;
                }
            } else {
                console.log('listener ' + messageJSON.resource + ' registered');
                if (messageJSON.action == 'link') {
                    var listener = {
                        resource: messageJSON.resource,
                        host: remote.address,
                        port: remote.port
                    };
                    this.listeners.push(listener);
                    delete messageJSON.action;
                    messageJSON.status = 1;
                }
            }
        }

        responseBody = JSON.stringify(messageJSON);
        console.log(responseBody);

        //sending response
        this.udpServer.send(responseBody, 0, responseBody.length, remote.port, remote.address, function (err, bytes) {
            if (err) {
                throw err;
            }

            console.log('UDP Server message sent to ' + remote.address + ':' + remote.port);
        }.bind(this));


    }.bind(this));

    this.interval = setInterval(function () {
        var d = new Date();
        var time = d.getTime();
        var resource = 'tea';
        var data = 'green';

        if (Math.random() > 0.5) {
            resource = 'coffee';
            data = 'black';
            if (Math.random() > 0.6) {
                data = 'white';
            }
        } else {
            if (Math.random() > 0.4) {
                data = 'herb';
            }
        }

        var messageJSON = {
            time: time,
            type: 'L',
            resource: resource,
            data: data
        };

        var responseBody = JSON.stringify(messageJSON);

        for (l in this.listeners) {
            var listener = this.listeners[l];
            console.log(listener);

            this.udpServer.send(responseBody, 0, responseBody.length, listener.port, listener.address, function (err, bytes) {
                if (err) {
                    throw err;
                }

                console.log('UDP Server message sent to ' + listener.address + ':' + listener.port);
            }.bind(this));

        }
    }.bind(this), 10000);

    this.udpServer.bind(port, host);
};

BACnetTestController.prototype.stop = function () {
    this.udpServer.close();
}

//TEST

var SERVER_HOST = '127.0.0.1';
// BACnet default PORT
var SERVER_PORT = 47808;

var CLIENT_HOST = '127.0.0.1';
var CLIENT_PORT = 48651;

var testController = new BACnetTestController();
testController.initialize(SERVER_PORT, SERVER_HOST);

var BACNetAdapter = require('../lib/bacNetAdapter.js');
var testAdapter = BACNetAdapter.create();
testAdapter.initialize(CLIENT_PORT, CLIENT_HOST);

//testAdapter.sendXRequest(SERVER_PORT, SERVER_HOST);
testAdapter.registerXListener(SERVER_PORT, SERVER_HOST);