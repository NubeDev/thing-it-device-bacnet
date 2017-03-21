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
    var deferred = q.defer();
    console.log('test controller initialize');
    this.udpServer = dgram.createSocket('udp4');

    this.listeners = [];

    this.udpServer.on('listening', function () {
        var address = this.udpServer.address();

        deferred.resolve();
        console.log('UDP Server listening on ' + address.address + ":" + address.port);
    }.bind(this));

    this.udpServer.on('message', function (message, remote) {
        console.log('Received UDP message from ' + remote.address + ':' + remote.port);

        //check out message
        //console.log(message);
        //console.log(Buffer.isBuffer(message));
        //console.log(Buffer.isEncoding('utf-8'))

        //encodings
        //console.log('hex - ' + message.toString('hex'));
        //console.log('ascii - ' + message.toString('ascii'));
        //console.log('base64 - ' + message.toString('base64'));
        //console.log('utf8 - ' + message.toString('utf-8'));

        this.handleMessage(message);
        /*
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
            var matchingListener = _.find(this.listeners, {host: remote.address, port: remote.port, objectId: messageJSON.objectId, propertyId: messageJSON.propertyId});

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

        if (messageJSON.type == 'USCOV') {
            console.log('try matching listener');
            //TODO: find a better way to match for more critera then only propertyId
            var matchingListener = _.find(this.listeners, {host: remote.address, port: remote.port, objectId: messageJSON.objectId, propertyId: messageJSON.propertyId});

            if (matchingListener) {
                this.listeners = _.without(this.listeners, matchingListener);
                console.log('listener ' + messageJSON.propertyId + ' removed');
                messageJSON.status = 1;
            } else {
                console.log('listener ' + messageJSON.propertyId + ' did not exist');
                messageJSON.status = 2;
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

        */
    }.bind(this));


    /*
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
    */

    if (host) {
        this.udpServer.bind(port, host);
    } else {
        this.udpServer.bind(port);
    }

    return deferred.promise;
};

BACnetTestController.prototype.stop = function () {
    this.udpServer.close();
};

BACnetTestController.prototype.send = function (buffer, offset, length, port, address) {
    if (address == '255.255.255.255') {
        this.udpServer.setBroadcast(true);
    }

    this.udpServer.send(buffer, offset, length, port, address, function (err, bytes) {
        if (err) {
            throw err;
        }
        console.log('UDP Server message sent to ' + address + ':' + port);
        this.udpServer.setBroadcast(false);
    }.bind(this));
};

BACnetTestController.prototype.handleMessage = function (message) {
    console.log(message);
    var hexMessage = message.toString('hex')

    //BVLC
    var bvlc = hexMessage.substr(0,8);
    console.log(bvlc);
    var type = bvlc.substr(0,2);
    console.log('type - ' + type);
    var func = bvlc.substr(2,2);
    console.log('func - ' + func);
    var len = bvlc.substr(4,4);
    console.log('messageLength - ' + this.hexStringToIntNumber(len) + ' byte(s)');
    console.log('hexMessageLength - ' + hexMessage.length);

    //NPDU
    var version = hexMessage.substr(8,2);
    console.log('version - ' + version);
    var control = hexMessage.substr(10,2);
    console.log('control - ' + control);
    var controlBinary = this.addLeadingZerosToString(this.hexStringToBinaryString(control),8);
    console.log('controlBinary - ' + controlBinary);
    var destinationSpecifier = controlBinary.substr(2,1);
    console.log('controlBinary -> destinationSpecifier - ' + destinationSpecifier);
    var expectingReply = controlBinary.substr(5,1);
    console.log('controlBinary -> expectingReply - ' + expectingReply);

    var npdu;
    var apdu;

    if (destinationSpecifier == '0') {
        npdu = hexMessage.substr(8,4);
        apdu = hexMessage.substr(12);
    } else {
        npdu = hexMessage.substr(8,12);
        apdu = hexMessage.substr(20);
    }

    console.log('bvlc - ' + bvlc);
    console.log('npdu - ' + npdu);
    console.log('apdu - ' + apdu);

    //APDU
    var apduType = apdu.substr(0,1);
    var apduTypeInt = this.hexStringToIntNumber(apduType);
    console.log('apduType - ' + apduType);

    if (apduType == 1) {
        console.log('UNCONFIRMED-REQUEST');
        var serviceChoice = apdu.substr(1,2);
        console.log('serviceChoice - ' + this.hexStringToIntNumber(serviceChoice));
    }

    if (apduType == 3) {
        console.log('COMPLEX-ACK');
        var pduFlags = apdu.substr(1, 1);
        console.log('pduFlags - ' + this.addLeadingZerosToString(this.hexStringToBinaryString(pduFlags), 4));
        var invokeId = apdu.substr(2, 2);
        console.log('invokeId - ' + this.hexStringToIntNumber(invokeId));
        var serviceChoice = apdu.substr(4,2);
        var serviceChoiceInt = this.hexStringToIntNumber(serviceChoice);
        console.log('serviceChoice - ' + this.hexStringToIntNumber(serviceChoice));

        if (serviceChoiceInt == 12) {
            console.log('READ PROPERTY');
            var readProperty = apdu.substr(6);
            console.log(readProperty);
            //TODO: continue reading properties, each property has upfront one byte called tag which holds the kind and length of property that follows
        }
    }

};

BACnetTestController.prototype.whoIs = function (address) {
    //81 0b 00 0c 01 20 ff ff 00 ff 10 08 //whoIs message to whole network
    var address = address;

    if (!address) {
        address = '255.255.255.255';
    }

    var bvlc = '810b000c';
    var npdu = '0120ffff00ff';
    var apdu = '1008';

    var m = bvlc + npdu + apdu;

    var buffer = Buffer.from(m, 'hex');

    console.log(buffer);
    this.send(buffer, 0, buffer.length, 47808, address);
};

BACnetTestController.prototype.bvlc = function(messageLength, messageFunction) {
    //BVLC always consists of 4 bytes
    var bvlc = '';

    //1st byte type, is always the same indicating
    var type = '81';

    //2nd byte function of message, that is unicast (e.g. readProperty) or broadcast (e.g. whoIs)
    var func = '0a';
    if (messageFunction == 'broadcast') {
        func = '0b';
    }

    //3rd and 4th byte for length of total message, so bvlc, npdu and apdu together
    var len = messageLength.toString(16);

    if (len.length < 4) {
        while (len.length < 4) {
            len = '0' + len;
        }
    }

    bvlc = type + func + len;
    return bvlc;
};

BACnetTestController.prototype.npdu = function() {
    var npdu = '';

    //first byte for BACnet protocol version
    var version = '01';

    //second byte for type of request
    var type = '04'; //4 indicates a confirmed request

    npdu = version + type;

    return npdu;
};

BACnetTestController.prototype.apdu = function() {
    var apdu = '';

    //00 05 01 0c

    //1st byte apdu type & pdu flags
    var type = '0'; //0 is confirmed request
    var flags = '0'; //there are different things encoded in here

    //2nd byte max response segments accepted & size of maximum adpu accepted
    var maxRespSegments = '0'; //0 means unspecified
    var maxSizeADPU = '5'; //5 means up to 1476 octets are accepted

    //3rd byte invokeId
    var invokeId = '01'; //request identifier

    //4th byte service choice
    var serviceChoice = '0c'; //12 is readProperty //15 is writeProperty //5 is subscribeCOV

    apdu = type + flags + maxRespSegments + maxSizeADPU + invokeId + serviceChoice;

    return apdu;
};

BACnetTestController.prototype.addLeadingZerosToString = function (string, stringLength) {
    //console.log('string - ' + string);
    //console.log('stringLength - ' + stringLength);

    var str = string;

    if (str.length < stringLength) {
        while (str.length < stringLength) {
            str = '0' + str;
        }
    }
    //console.log(str);
    return str;
};

BACnetTestController.prototype.intNumberToHexString = function (intNumber) {
    //console.log('intNumber - ' + intNumber);
    var hexString = intNumber.toString(16);
    //console.log('hexString - ' + hexString);
    return hexString;
};

BACnetTestController.prototype.hexStringToIntNumber = function (hexString) {
    //console.log('hexString - ' + hexString);
    var intNumber = parseInt(hexString, 16);
    //console.log('intNumber - ' + intNumber);
    return intNumber;
};

BACnetTestController.prototype.binaryStringToHexString = function (binaryString) {
    //console.log('binaryString - ' + binaryString);
    var intNumber = parseInt(binaryString, 2);
    //console.log('intNumber - ' + intNumber);
    var hexString = intNumber.toString(16);
    //console.log('hexString - ' + hexString);
    return hexString;
};

BACnetTestController.prototype.hexStringToBinaryString = function (hexString) {
    //console.log('hexString - ' + hexString);
    var intNumber = parseInt(hexString, 16);
    //console.log('intNumber - ' + intNumber);
    var binaryString = intNumber.toString(2);
    //console.log('binaryString - ' + binaryString);
    return binaryString;
};

BACnetTestController.prototype.intNumberToBinaryString = function (intNumber) {
    //console.log('intNumber - ' + intNumber);
    var binaryString = intNumber.toString(2);
    //console.log('binaryString - ' + binaryString);
    return binaryString;
};

BACnetTestController.prototype.binaryStringToIntNumber = function (binaryString) {
    //console.log('binaryString - ' + binaryString);
    var intNumber = parseInt(binaryString, 2);
    //console.log('intNumber - ' + intNumber);
    return intNumber;
};

BACnetTestController.prototype.readProperty = function (address, objectType, objectId, property) {
    //example for reading (12) the present value (85) of an binaryValue object (5) with Id (12)
    //'./bacrp 1 5 12 85' //bacnet-stack command in terminal
    //81 0a 00 11 01 04 00 05 01 0c 0c 01 40 00 0c 1955

    var npdu = this.npdu();
    var apdu = this.apdu();

    //0c 01 40 00 0c 19 55
    var readProperty = '';

    //object identifier
    //first byte context tag, tag class, length value type
    var contextTagObject = '0'; //contextTag 0 meaning this is the first parameter
    var tagClassLengthValueObject = 'c'; //tagClass 1 (binary 1000) and lenght 4 (binary 100) encoded together as binary 1100 equals hex c

    //next four bytes for object type (10 bit) and for instance number (22 bit)
    //var objectType = 5; //e.g. binaryValue is 5 that is 101
    //var objectId = 12; //e.g. 12 is 1100

    var binaryObjectType = this.intNumberToBinaryString(objectType);
    var binaryObjectId = this.addLeadingZerosToString(this.intNumberToBinaryString(objectId), 22);

    var objectInstance = this.addLeadingZerosToString(this.binaryStringToHexString(binaryObjectType + binaryObjectId),8);

    //property identifier
    //first byte context tag, tag class, length value type
    var contextTagProperty = '1'; //contextTag 1 meaning this is the second parameter
    var tagClassLengthValueProperty = '9'; //tagClass 1 and length 1 encoded together as binary 1001 equals hex 9

    //next byte for property key (e.g. present-value has 85 equals hex 55)
    //var propertyKey = '55'; //presentValue is 85 that is in hex 55
    var propertyKey = this.intNumberToHexString(property);

    readProperty = contextTagObject + tagClassLengthValueObject + objectInstance + contextTagProperty + tagClassLengthValueProperty + propertyKey;

    var m = npdu + apdu + readProperty;

    m = this.bvlc((m.length / 2) + 4) + m;

    var buffer = Buffer.from(m, 'hex');

    console.log(buffer);
    this.send(buffer, 0, buffer.length, 47808, address);
};

BACnetTestController.prototype.writeProperty = function (address, objectType, objectId, property, value) {
    //example for writing (15) the present value (85) of an binaryValue object (5) with Id (12) to (0).
    //priority is low (16), there is no arrayIndex (-1) and it is binaryData (9)
    //'./bacwp 1 5 12 85 16 -1 9 0' //bacnet-stack command in terminal
    //810a001701040005010f0c0140000c19553e91003f4910

    var bvlc = '810a0017';
    var npdu = '0104';
    var apdu = '0005010f0c0140000c19553e91003f4910';

    var m = bvlc + npdu + apdu;

    var buffer = Buffer.from(m, 'hex');

    console.log(buffer);
    this.send(buffer, 0, buffer.length, 47808, address);
};

BACnetTestController.prototype.subscribeCOV = function (address, objectType, objectId, processId, type, time) {
    //example for subscribing (5) to a binaryValue object (5) with Id (12) and processId (1) of suscriptionType (unconfirmed)
    //and with a timelimit of (60) seconds
    //'./bacscov 1 5 12 1 unconfirmed 60' //bacnet-stack command in terminal
    //810a001501040005010509011c0140000c2900393c

    var bvlc = '810a0015';
    var npdu = '0104';
    var apdu = '0005010509011c0140000c2900393c';

    var m = bvlc + npdu + apdu;

    var buffer = Buffer.from(m, 'hex');

    console.log(buffer);
    this.send(buffer, 0, buffer.length, 47808, address);
};

//START TEST CONTROLLER

//var SERVER_HOST = '127.0.0.1';
//var SERVER_HOST = '192.168.0.103';
// BACnet default PORT
var SERVER_PORT = 47808;

var testController = new BACnetTestController();
//testController.initialize(SERVER_PORT, 'localhost');
testController.initialize(SERVER_PORT)
    .then(function() {
        //testController.whoIs();
        testController.readProperty('192.168.0.108', 5, 12, 85);
        //testController.readProperty('192.168.0.108', 2, 69, 85);
        //testController.writeProperty('192.168.0.108');
        //testController.subscribeCOV('192.168.0.108');
    }.bind(this));