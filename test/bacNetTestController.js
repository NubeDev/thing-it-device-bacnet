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

        if (messageJSON.type == 'RP') {
            console.log('responding read property');
            messageJSON.propertyValue = Math.random() * 100;
            messageJSON.status = 1;
        }

        if (messageJSON.type == 'WP') {
            console.log('responding write property');
            messageJSON.status = 1;
        }

        if (messageJSON.type == 'SCOV') {
            console.log('try matching listener');
            //TODO: find a better way to match for more critera then only propertyId
            var matchingListener = _.find(this.listeners, {propertyId: messageJSON.propertyId});

            if (matchingListener) {
                console.log('listener ' + messageJSON.propertyId + ' already exists');
                messageJSON.status = 2;
            } else {
                console.log('listener ' + messageJSON.propertyId + ' registered');
                var listener = {
                    host: remote.address,
                    port: remote.port,
                    bacNetId: messageJSON.bacNetId,
                    deviceId: messageJSON.deviceId,
                    objectId: messageJSON.objectId,
                    propertyId: messageJSON.propertyId
                };
                this.listeners.push(listener);
                messageJSON.status = 1;
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

    //TODO: maybe set up better simulation data for notifications
    this.interval = setInterval(function () {
        var d = new Date();
        var time = d.getTime();

        for (l in this.listeners) {
            var listener = this.listeners[l];
            console.log(listener);

            var messageJSON = {
                time: time,
                //Confirmed COV Notification
                type: 'CCOVN',
                bacNetId: listener.bacNetId,
                deviceId: listener.deviceId,
                objectId: listener.objectId,
                propertyId: listener.propertyId,
                propertyValue: Math.random() * 200
            };

            var responseBody = JSON.stringify(messageJSON);

            this.udpServer.send(responseBody, 0, responseBody.length, listener.port, listener.host, function (err, bytes) {
                if (err) {
                    throw err;
                }

                console.log('UDP Server message sent to ' + listener.host + ':' + listener.port);
            }.bind(this));

        }
    }.bind(this), 10000);
    
    this.udpServer.bind(port, host);
};

BACnetTestController.prototype.stop = function () {
    this.udpServer.close();
}

//START TEST CONTROLLER

var SERVER_HOST = '127.0.0.1';
// BACnet default PORT
var SERVER_PORT = 47808;

var testController = new BACnetTestController();
testController.initialize(SERVER_PORT, SERVER_HOST);