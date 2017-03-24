var dgram = require('dgram');
var q = require('q');
var _ = require('underscore');

var bvlc = new BVLC();
var npdu = new NPDU();
var apdu = new APDU();

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
    var result = {};
    var hexMessage = message.toString('hex')

    //BVLC
    var bvlc = hexMessage.substr(0, 8);
    var type = bvlc.substr(0, 2);
    var func = bvlc.substr(2, 2);
    var len = bvlc.substr(4, 4);
    console.log('messageLength - ' + this.hexStringToIntNumber(len) + ' byte(s)');

    //NPDU
    var version = hexMessage.substr(8, 2);
    var control = hexMessage.substr(10, 2);
    var controlBinary = this.addLeadingZerosToString(this.hexStringToBinaryString(control), 8);
    var destinationSpecifier = controlBinary.substr(2, 1);
    var expectingReply = controlBinary.substr(5, 1);

    var npdu;
    var apdu;

    if (destinationSpecifier == '0') {
        npdu = hexMessage.substr(8, 4);
        apdu = hexMessage.substr(12);
    } else {
        npdu = hexMessage.substr(8, 12);
        apdu = hexMessage.substr(20);
    }

    //APDU
    var apduType = apdu.substr(0, 1);
    var apduTypeInt = this.hexStringToIntNumber(apduType);

    if (apduType == 1) {
        console.log('UNCONFIRMED-REQUEST');
        var serviceChoice = apdu.substr(2, 2);
        var serviceChoiceInt = this.hexStringToIntNumber(serviceChoice);
        console.log('serviceChoice - ' + serviceChoiceInt);
        if (serviceChoiceInt == 2) {
            console.log('unconfirmedCOVNotification');
            var notification = apdu.substr(4);

            //processId
            var tagProcessId = this.hexStringToIntNumber(notification.substr(0,2));
            var processId = this.hexStringToIntNumber(notification.substr(2,2));
            console.log('processId - ' + processId);

            //device
            var tagDevice = this.hexStringToIntNumber(notification.substr(4,2));
            var deviceBinary = this.addLeadingZerosToString(this.hexStringToBinaryString(notification.substr(6,8)), 32);
            var deviceType = this.binaryStringToIntNumber(deviceBinary.substr(0, 10));
            console.log('deviceType - ' + deviceType);
            var deviceId = this.binaryStringToIntNumber(deviceBinary.substr(10, 22));
            console.log('deviceId - ' + deviceId);

            //object
            var tagObject = this.hexStringToIntNumber(notification.substr(14,2));
            var objectBinary = this.addLeadingZerosToString(this.hexStringToBinaryString(notification.substr(16,8)), 32);
            var objectType = this.binaryStringToIntNumber(objectBinary.substr(0, 10));
            console.log('objectType - ' + objectType);
            var objectId = this.binaryStringToIntNumber(objectBinary.substr(10, 22));
            console.log('objectId - ' + objectId);

            //lifeTime
            var tagLifeTime = this.hexStringToIntNumber(notification.substr(24,2));
            var lifeTime = this.hexStringToIntNumber(notification.substr(26,2));
            console.log('lifeTime - ' + lifeTime);

            //values
            //presentValue

            //statusFlags
        } else if (serviceChoiceInt == 8) {
            console.log('whoIs');
        }
    } else if (apduType == 2) {
        console.log('SIMPLE-ACK');
        var invokeId = apdu.substr(2, 2);
        console.log('invokeId - ' + this.hexStringToIntNumber(invokeId));
        var serviceChoice = apdu.substr(4, 2);
        var serviceChoiceInt = this.hexStringToIntNumber(serviceChoice);
        console.log('serviceChoice - ' + serviceChoiceInt);
        if (serviceChoice == 5) {
            console.log('SubscribeCOV successful!');
        } else if (serviceChoiceInt == 15) {
            console.log('WriteProperty successful!');
        }
    } else if (apduType == 3) {
        console.log('COMPLEX-ACK');
        var pduFlags = apdu.substr(1, 1);
        var invokeId = apdu.substr(2, 2);
        console.log('invokeId - ' + this.hexStringToIntNumber(invokeId));
        var serviceChoice = apdu.substr(4, 2);
        var serviceChoiceInt = this.hexStringToIntNumber(serviceChoice);
        console.log('serviceChoice - ' + serviceChoiceInt);

        if (serviceChoiceInt == 12) {
            console.log('READ PROPERTY');
            var readProperty = apdu.substr(6);

            //read object
            var object = readProperty.substr(0, 10);

            var tagObject = object.substr(0, 2);
            var tagObjectBinary = this.addLeadingZerosToString(this.hexStringToBinaryString(tagObject), 8);
            var tagNumberObject = this.binaryStringToIntNumber(tagObjectBinary.substr(0, 4));
            var tagClassObject = this.binaryStringToIntNumber(tagObjectBinary.substr(4, 1));
            var tagValueObject = this.binaryStringToIntNumber(tagObjectBinary.substr(5, 3));

            var objectIdentifier = object.substr(2, 8);
            var objectIdentifierBinary = this.addLeadingZerosToString(this.hexStringToBinaryString(objectIdentifier), 32);
            var objectType = this.binaryStringToIntNumber(objectIdentifierBinary.substr(0, 10));
            var instanceNumber = this.binaryStringToIntNumber(objectIdentifierBinary.substr(10, 22));
            console.log('instanceNumber - ' + instanceNumber);

            //read property
            var property = readProperty.substr(10, 4);

            var tagProperty = property.substr(0, 2);
            var tagPropertyBinary = this.addLeadingZerosToString(this.hexStringToBinaryString(tagProperty), 8);
            var tagNumberProperty = this.binaryStringToIntNumber(tagPropertyBinary.substr(0, 4));
            var tagClassProperty = this.binaryStringToIntNumber(tagPropertyBinary.substr(4, 1));
            var tagValueProperty = this.binaryStringToIntNumber(tagPropertyBinary.substr(5, 3));

            var propertyKey = this.hexStringToIntNumber(property.substr(2, 2));
            console.log('propertyKey - ' + propertyKey);

            //read value
            var valuePart = readProperty.substr(14);

            //open tag
            var openTag = valuePart.substr(0, 2);

            //value
            var value = valuePart.substr(2, valuePart.length - 4);

            var tagValue = value.substr(0, 2);
            var tagValueBinary = this.addLeadingZerosToString(this.hexStringToBinaryString(tagValue), 8);
            var tagNumberValue = this.binaryStringToIntNumber(tagValueBinary.substr(0, 4));
            var tagClassValue = this.binaryStringToIntNumber(tagValueBinary.substr(4, 1));
            var tagValueValue = this.binaryStringToIntNumber(tagValueBinary.substr(5, 3));

            var valueValue = value.substr(2);

            var propertyValue;

            if (tagNumberValue == 2) {
                buf = Buffer.from(valueValue, 'hex');
                propertyValue = buf.readUInt8(0);
                console.log('propertyValue - (Unsigned Int) ' + propertyValue);
            } else if (tagNumberValue == 4) {
                buf = Buffer.from(valueValue, 'hex');
                propertyValue = buf.readFloatBE(0);
                console.log('propertyValue - (Real) ' + propertyValue);
            } else if (tagNumberValue == 9) {
                console.log('Enumerated');
                propertyValue = this.hexStringToIntNumber(valueValue);
                console.log('propertyValue - (Enumerated) ' + propertyValue);
            } else {
                console.log('Unsupported DataType - Please look up which data type corresponds to the following info');
                console.log('tagNumberValue - ' + tagNumberValue);
                console.log('tagClassValue - ' + tagClassValue);
                console.log('tagValueValue - ' + tagValueValue);
                propertyValue = valueValue;
                console.log('propertyValue - (Needs to be converted) ' + propertyValue);
            }

            //close tag
            var closeTag = valuePart.substr(valuePart.length - 2, 2);
        }
    } else if (apduType == 5) {
        console.log('ERROR');
        //TODO: Implement some errors
    } else {
        console.log('Unsupported APDU Type');
        console.log('APDU type - ' + apduTypeInt);
    }

};

BACnetTestController.prototype.whoIs = function (address) {
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

BACnetTestController.prototype.readProperty = function (address, objectType, objectId, property) {
    var invokeId = 1;
    var serviceChoice = 12; // this is the number for service read property
    //TODO: Size of buffer needs to be adjusted dynamically
    var buffer = Buffer.alloc(50);
    var offset = new Offset(4);

    npdu.write(buffer, offset);
    apdu.write(buffer, offset, invokeId, serviceChoice);
    apdu.writeObject(buffer, offset, 0, objectType, objectId);
    apdu.writeProperty(buffer, offset, 1, property);
    bvlc.write(buffer, offset);

    console.log(buffer);
    this.send(buffer, 0, buffer.length, 47808, address);
};

BACnetTestController.prototype.writeProperty = function (address, objectType, objectId, property, dataType, propertyValue, priority) {
    //example for writing (15) the present value (85) of an binaryValue object (5) with Id (12) to (0).
    //priority is low (16), there is no arrayIndex (-1) and it is binaryData (9)
    //'./bacwp 1 5 12 85 16 -1 9 0' //bacnet-stack command in terminal
    //81 0a 00 17 01 04 00 05 01 0f 0c 01 40 00 0c 19 55 3e 91 00 3f 49 10
    var invokeId = 1;
    var serviceChoice = 15;
    //TODO: Size of buffer needs to be adjusted dynamically
    var buffer = Buffer.alloc(50);
    var offset = new Offset(4);

    npdu.write(buffer, offset);
    apdu.write(buffer, offset, invokeId, serviceChoice);
    apdu.writeObject(buffer, offset, 0, objectType, objectId);
    apdu.writeProperty(buffer, offset, 1, property);
    apdu.writeValue(buffer, offset, 3, dataType, propertyValue);
    apdu.writeTaggedParameter(buffer, offset, 4, priority);
    bvlc.write(buffer, offset);

    console.log(buffer);
    this.send(buffer, 0, buffer.length, 47808, address);
};

BACnetTestController.prototype.subscribeCOV = function (address, objectType, objectId, processId, isConfirmed, lifeTime) {
    var invokeId = 1;
    var serviceChoice = 5; // this is the number for service subscribeCOV

    //TODO: Size of buffer needs to be adjusted dynamically
    var buffer = Buffer.alloc(50);
    var offset = new Offset(4);

    npdu.write(buffer, offset);
    apdu.write(buffer, offset, invokeId, serviceChoice);
    apdu.writeTaggedParameter(buffer, offset, 0, processId);
    apdu.writeObject(buffer, offset, 1, objectType, objectId);
    if (isConfirmed != undefined) {
        apdu.writeTaggedParameter(buffer, offset, 2, isConfirmed);
    }
    if (lifeTime != undefined) {
        apdu.writeTaggedParameter(buffer, offset, 3, lifeTime);
    }
    bvlc.write(buffer, offset);

    console.log(buffer);
    this.send(buffer, 0, buffer.length, 47808, address);
};



function BVLC() {
}

BVLC.prototype.write = function (buffer, offset, messageFunction) {
    //1st byte type, is always the same indicating
    //2nd byte function of message, that is unicast (e.g. readProperty) or broadcast (e.g. whoIs)

    var type = 0x81;
    var func = 0x0a;
    if (messageFunction == 'broadcast') {
        func = 0x0b;
    }
    var len = offset.set(0);

    buffer.writeUInt8(type, offset.up());
    buffer.writeUInt8(func, offset.up());
    buffer.writeUInt16BE(len, offset.up());
};

BVLC.prototype.read = function (bvlc) {
};

function NPDU() {
};

NPDU.prototype.write = function (buffer, offset) {
    //1st byte version
    //2nd byte type

    var version = 0x01; // Version: 0x01 (ASHRAE 135-1995)
    var type = 0x04; // 0x04 indicates reply expected

    buffer.writeUInt8(version, offset.up());
    buffer.writeUInt8(type, offset.up());
};

NPDU.prototype.read = function (npdu) {
};

function APDU() {
};

APDU.prototype.write = function (buffer, offset, invokeId, serviceChoice) {
    //1st byte apdu type & pdu flags
    //2nd byte max response segments accepted & size of maximum adpu accepted
    //3rd byte invokeId
    //4th byte service choice

    var type = 0x0; //0 is confirmed request
    var flags = 0x0; //there are different things encoded in here
    var maxRespSegments = 0x0; //0 means unspecified
    var maxSizeADPU = 0x5; //5 means up to 1476 octets are accepted

    buffer.writeUInt8((type << 4) | flags, offset.up());
    buffer.writeUInt8((maxRespSegments << 4) | maxSizeADPU, offset.up());
    buffer.writeUInt8(invokeId, offset.up());
    buffer.writeUInt8(serviceChoice, offset.up());
};

APDU.prototype.writeTag = function (buffer, offset, contextTagNumber, tagClass, tagValue) {
    //contextTagNumber has 4 bits, tagClass 1 bit and tagValue 3 bits
    var tagByte = (contextTagNumber << 4) | (tagClass << 3) | tagValue;
    buffer.writeUInt8(tagByte, offset.up());
};

APDU.prototype.writeObject = function (buffer, offset, context, objectType, objectId) {
    //objectType has 10 bits and objectId has 22bits
    var objectBytes = (objectType << 22) | objectId;
    this.writeTag(buffer, offset, context, 1, 4);
    buffer.writeUInt32BE(objectBytes, offset.up(4));
};

APDU.prototype.writeProperty = function (buffer, offset, context, propertyKey) {
    this.writeTag(buffer, offset, context, 1, 1);
    buffer.writeUInt8(propertyKey, offset.up());
};

APDU.prototype.writeValue = function (buffer, offset, context, dataType, propertyValue) {
    //TODO: only dataType 2 (unsigned int), 4 (real/float), 9 (enumerated) are supported by this code
    var len = 1; //lenght 1 byte is sufficient for dataType 2 (unsigned int) and dataType 9 (enumerated)
    if (dataType == 4) {
        len = 4; //dataType 4 is a real/float, which is 4 bytes
    }

    //openTag
    apdu.writeTag(buffer, offset, context, 1, 6);
    //tag indicating dataType of value
    apdu.writeTag(buffer, offset, dataType, 0, len);
    //value
    if (dataType == 4) {
        buffer.writeFloatBE(propertyValue, offset.up(len));
    } else {
        buffer.writeUInt8(propertyValue, offset.up(len));
    }
    //closeTag
    apdu.writeTag(buffer, offset, context, 1, 7);
};

APDU.prototype.writeTaggedParameter = function (buffer, offset, context, param) {
    apdu.writeTag(buffer, offset, context, 1, 1);
    buffer.writeUInt8(param, offset.up());
};

APDU.prototype.read = function () {
};

function Offset(value) {
    this.offset = 0;

    if (value != undefined) {
        this.offset = value;
    }
};

Offset.prototype.get = function (value) {
    return this.offset;
};

Offset.prototype.set = function (value) {
    var prev = new Number(this.offset);
    this.offset = value;
    return prev;
};

Offset.prototype.up = function (diff) {
    if (!diff) {
        diff = 1;
    }

    this.offset = this.offset + diff;
    return this.offset - diff;
};

Offset.prototype.down = function (diff) {
    if (!diff) {
        diff = 1;
    }

    this.offset = this.offset - diff;
    return this.offset + diff;
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
        //tests for read in the following order: binaryValue, analogValue, multiStateValue
        //testController.readProperty('192.168.0.108', 5, 12, 85);
        //testController.readProperty('192.168.0.108', 2, 69, 85);
        //testController.readProperty('192.168.0.108', 19, 26, 85);
        //tests for write in the following order: binaryValue, analogValue, multiStateValue
        //testController.writeProperty('192.168.0.108', 5, 12, 85, 9, 0, 16);
        //testController.writeProperty('192.168.0.108', 2, 69, 85, 4, 14.55, 16);
        //testController.writeProperty('192.168.0.108', 19, 26, 85, 2, 4, 16);
        //tests for subscribe
        //testController.subscribeCOV('192.168.0.108', 5, 12, 1, 0, 0);
        //testController.subscribeCOV('192.168.0.108', 2, 69, 1, 0, 0);
        //testController.subscribeCOV('192.168.0.108', 19, 26, 1, 0, 0);
        //cancel subscription
        //testController.subscribeCOV('192.168.0.108', 5, 12, 1);
    }.bind(this));