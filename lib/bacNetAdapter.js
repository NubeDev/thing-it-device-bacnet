module.exports = {
    create: function () {
        return new BACnetAdapter();
    }
};

const BACNET_DEFAULT_PORT = 47808;

const BACNET_OBJECT_TYPES = {
    AnalogInput: 0,
    AnalogOutput: 1,
    AnalogValue: 2,
    BinaryInput: 3,
    BinaryOutput: 4,
    BinaryValue: 5,
    Calendar: 6,
    Command: 7,
    Device: 8,
    EventEnrollment: 9,
    File: 10,
    Group: 11,
    Loop: 12,
    MultiStateInput: 13,
    MultiStateOutput: 14,
    NotificationClass: 15,
    Program: 16,
    Schedule: 17,
    Averaging: 18,
    MultiStateValue: 19,
    TrendLog: 20,
    LifeSafetyPoint: 21,
    LifeSafetyZone: 22
};

const BACNET_PROPERTY_KEYS = {
    presentValue: 85,
    statusFlags: 111
};

const BACNET_DATA_TYPES = {
    unsignedInt: 2,
    real: 4,
    bitString: 8,
    enumerated: 9
};

const BACNET_PRIORITIES = {
    low:16
};

const BACNET_SERVICES = {
    unconfirmedSubscribeCOVNotification: 2,
    subscribeCOV: 5,
    readProperty: 12,
    writeProperty: 15
};

var dgram = require('dgram');
var q = require('q');
var _ = require('underscore');

var bvlc = new BVLC();
var npdu = new NPDU();
var apdu = new APDU();
var bms = new BACnetMessageService();

/**
 *
 * @constructor
 */
function BACnetAdapter() {
};

/**
 * @param host
 * @param port
 */
BACnetAdapter.prototype.initialize = function (deviceIpAddress) {
    var deferred = q.defer();
    console.log('adapter initialize');
    this.deviceIpAddress = deviceIpAddress;

    this.invokeIdService = new IdManagementService();

    this.requests = [];
    this.listeners = [];

    this.TIMEOUT = 10000;

    this.udpClient = dgram.createSocket('udp4');

    this.udpClient.on('listening', function () {
        var address = this.udpClient.address();

        deferred.resolve();
        console.log('UDP Server listening on ' + address.address + ":" + address.port);
    }.bind(this));

    this.udpClient.on('message', function (message, remote) {
        console.log(remote.address + ':' + remote.port + ' - ' + message);

        this.handleMessage(message);
    }.bind(this));

    this.udpClient.bind(BACNET_DEFAULT_PORT);

    return deferred.promise;
};

BACnetAdapter.prototype.stop = function () {
    console.log('adapter stop');
    this.udpClient.close();
};

BACnetAdapter.prototype.handleMessage = function (message) {
    console.log(message);
    var messageJSON = bms.messageToJSON(message);
    console.log(messageJSON);

    if (messageJSON.serviceChoice == 12
        || messageJSON.serviceChoice == 15
        || messageJSON.serviceChoice == 5) {
         //matching back request
         console.log('try matching request');
         var matchingRequest = _.find(this.requests, {invokeId: messageJSON.invokeId, serviceChoice: messageJSON.serviceChoice});

         if (matchingRequest) {
             console.log('found request');
             this.invokeIdService.returnId(matchingRequest.invokeId);

             if (messageJSON.serviceChoice == 5) {
                 if (matchingRequest.isSubscribed) {
                     if (matchingRequest.listener) {
                         matchingRequest.listener.register();
                     }
                 } else {
                     if (matchingRequest.listener) {
                         matchingRequest.listener.unregister();
                     }
                 }
             }

             if (messageJSON.serviceChoice == 12) {
                 matchingRequest.params.propertyValue = messageJSON.propertyValue;
             }

             matchingRequest.resolve(matchingRequest.params);
         } else {
             console.log('could not find request');
         }
    } else if (messageJSON.serviceChoice == 2) {
        //matching back listener
        console.log('try matching notification');
        var matchingListener = _.find(this.listeners, {objectType: messageJSON.objectType, objectId: messageJSON.objectId});

        if (matchingListener) {
            console.log('received notification with objectType: ' + messageJSON.objectType + ' and objectId: ' + messageJSON.objectId + '-> calling back ...');
            matchingListener.callback(messageJSON);
        } else {
            console.log('no match for notification with objectType: ' + messageJSON.objectType + ' and objectId: ' + messageJSON.objectId);
        }
    } else {
        console.log('Service choice not supported');
    }
};

/**
 * Generic request send
 *
 * @param request
 * @returns {*}
 */
BACnetAdapter.prototype.sendRequest = function (request, callback) {
    console.log('adapter send request');
    var deferred = q.defer();
    request.deferred = deferred;
    request.adapter = this;

    this.requests.push(request);

    //this option might be needed to incl. whoIs broadcast messages
    /*
    if (address == '255.255.255.255') {
        this.udpClient.setBroadcast(true);
    }
    */

    this.udpClient.send(request.message, 0, request.message.length, BACNET_DEFAULT_PORT, this.deviceIpAddress, function (err, bytes) {
        if (err) {
            this.requests = _.without(this.requests, request);
            throw err;
        }

        request.startWaiting(this.TIMEOUT);

        console.log('UDP Client message sent to ' + this.ipAddress + ':' + BACNET_DEFAULT_PORT);
    }.bind(this));

    return deferred.promise;
};

BACnetAdapter.prototype.readProperty = function (objectTypeString, objectId, propertyIdString) {
    console.log('adapter - read property');

    var params = {
        objectType: objectTypeString,
        objectId: objectId,
        propertyId: propertyIdString
    };

    var invokeId = this.invokeIdService.getId();
    var objectType = BACNET_OBJECT_TYPES[objectTypeString];
    var propertyId = BACNET_PROPERTY_KEYS[propertyIdString];
    var message = bms.newReadPropertyMessage(invokeId,objectType,objectId,propertyId);

    var request = new Request();
    request.invokeId = invokeId;
    request.serviceChoice = BACNET_SERVICES.readProperty;
    request.params = params;
    request.message = message;

    return this.sendRequest(request);
};

BACnetAdapter.prototype.writeProperty = function (objectTypeString, objectId, propertyIdString, propertyValue) {
    console.log('adapter - write property');

    var params = {
        objectType: objectTypeString,
        objectId: objectId,
        propertyId: propertyIdString,
        propertyValue: propertyValue
    };

    var invokeId = this.invokeIdService.getId();
    var objectType = BACNET_OBJECT_TYPES[objectTypeString];
    var propertyId = BACNET_PROPERTY_KEYS[propertyIdString];
    var message = bms.newWritePropertyMessage(invokeId,objectType,objectId,propertyId,propertyValue);

    var request = new Request();
    request.invokeId = invokeId;
    request.serviceChoice = BACNET_SERVICES.writeProperty;
    request.params = params;
    request.message = message;

    return this.sendRequest(request);
};

BACnetAdapter.prototype.subscribeCOV = function (objectTypeString, objectId, callback) {
    console.log('adapter subscribe to change of value');

    var params = {
        objectType: objectTypeString,
        objectId: objectId
    };

    var invokeId = this.invokeIdService.getId();
    var objectType = BACNET_OBJECT_TYPES[objectTypeString];
    //TODO: see if i need a managmend for processIds or if i can just filter the notifications by objectType and objectId
    var message = bms.newSubscribeCOVMessage(invokeId,objectType,objectId,1,0,0);

    var listener = new Listener();
    listener.adapter = this;
    listener.objectType = objectType;
    listener.objectId = parseInt(objectId);
    listener.callback = callback;

    var request = new Request();
    request.invokeId = invokeId;
    request.serviceChoice = BACNET_SERVICES.subscribeCOV;
    request.isSubscribed = true
    request.params = params;
    request.message = message;
    request.listener = listener;

    return this.sendRequest(request);
};

BACnetAdapter.prototype.unsubscribeCOV = function (objectTypeString, objectId) {
    console.log('adapter unsubscribe to change of value');

    var params = {
        objectType: objectTypeString,
        objectId: objectId
    };

    var invokeId = this.invokeIdService.getId();
    var objectType = BACNET_OBJECT_TYPES[objectTypeString];
    //TODO: see if i need a managmend for processIds or if i can just filter the notifications by objectType and objectId
    var message = bms.newSubscribeCOVMessage(invokeId,objectType,objectId,1);
    var matchingListener = _.find(this.listeners, {objectType: objectType, objectId: objectId});

    var request = new Request();
    request.invokeId = invokeId;
    request.serviceChoice = BACNET_SERVICES.subscribeCOV;
    request.isSubscribed = false;
    request.params = params;
    request.message = message;
    if (matchingListener) {
        request.listener = matchingListener;
    }

    return this.sendRequest(request);
};

function Request() {
    this.time = (new Date()).getTime();
}

Request.prototype.startWaiting = function (timeout) {
    console.log('request start waiting');

    //add timeout
    this.timeout = setTimeout(function () {
        //Remove request
        this.adapter.requests = _.without(this.adapter.requests, this);
        this.deferred.reject('Got a big timeout.');
    }.bind(this), timeout);
};

Request.prototype.resolve = function (message) {
    console.log('request resolve');
    clearTimeout(this.timeout);
    this.adapter.requests = _.without(this.adapter.requests, this);
    if (this.callback) {
        this.callback();
    }
    this.deferred.resolve(message);
};

function Listener() {
    this.time = (new Date()).getTime();
}

Listener.prototype.register = function () {
    console.log('add listener to listeners');
    this.adapter.listeners.push(this);
};

Listener.prototype.unregister = function () {
    console.log('remove listener from listeners');
    this.adapter.listeners = _.without(this.adapter.listeners, this);
};

function IdManagementService() {
    this.max = 0xFF;
    this.activeIds = [];
};

IdManagementService.prototype.getId = function () {
    for (var i = 1; i < this.max; i++) {
        if(!_.contains(this.activeIds, i)) {
            this.activeIds.push(i);
            return i;
        }
    }
};

IdManagementService.prototype.returnId = function (id) {
    this.activeIds = _.without(this.activeIds, id);
};

function BACnetMessageService() {
};

BACnetMessageService.prototype.newReadPropertyMessage = function (invokeId, objectType, objectId, property) {
    var serviceChoice = 12; // this is the number for service read property
    var buffer = Buffer.alloc(50);
    var offset = new Offset(4);

    npdu.write(buffer, offset);
    apdu.write(buffer, offset, invokeId, serviceChoice);
    apdu.writeObject(buffer, offset, 0, objectType, objectId);
    apdu.writeProperty(buffer, offset, 1, property);
    bvlc.write(buffer, offset);

    return buffer;
};

BACnetMessageService.prototype.newWritePropertyMessage = function (invokeId, objectType, objectId, property, propertyValue) {
    var serviceChoice = 15;
    //TODO: see if in some cases another priority is needed
    var priority = 16;
    var dataType;

    if (objectType == BACNET_OBJECT_TYPES.AnalogValue) {
        dataType = BACNET_DATA_TYPES.real;
    } else if (objectType == BACNET_OBJECT_TYPES.BinaryValue) {
        dataType = BACNET_DATA_TYPES.enumerated;
    } else if (objectType == BACNET_OBJECT_TYPES.MultiStateValue) {
        dataType = BACNET_DATA_TYPES.unsignedInt;
    }

    var buffer = Buffer.alloc(50);
    var offset = new Offset(4);

    npdu.write(buffer, offset);
    apdu.write(buffer, offset, invokeId, serviceChoice);
    apdu.writeObject(buffer, offset, 0, objectType, objectId);
    apdu.writeProperty(buffer, offset, 1, property);
    apdu.writeValue(buffer, offset, 3, dataType, propertyValue);
    apdu.writeTaggedParameter(buffer, offset, 4, priority);
    bvlc.write(buffer, offset);

    return buffer;
};

BACnetMessageService.prototype.newSubscribeCOVMessage = function (invokeId, objectType, objectId, processId, isConfirmed, lifeTime) {
    var serviceChoice = 5; // this is the number for service subscribeCOV
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

    return buffer;
};

BACnetMessageService.prototype.messageToJSON = function (message) {
    var messageJSON = {};
    var offset = new Offset();

    var bvlcJSON = bvlc.read(message, offset);
    var npduJSON = npdu.read(message, offset);
    var apduJSON = apdu.read(message, offset);

    //the following code provides a short version of the most important data
    if (apduJSON.invokeId) messageJSON.invokeId = apduJSON.invokeId;
    messageJSON.serviceChoice = apduJSON.serviceChoice;
    if (apduJSON.processId) messageJSON.processId = apduJSON.processId.value;
    if (apduJSON.lifeTime) messageJSON.lifeTime = apduJSON.lifeTime.value;
    if (apduJSON.object) {
        messageJSON.objectType = apduJSON.object.objectType;
        messageJSON.objectId = apduJSON.object.objectId;
    }
    if (apduJSON.property) messageJSON.propertyId = apduJSON.property.propertyKey;
    if (apduJSON.propertyValue) messageJSON.propertyValue = apduJSON.propertyValue.propertyValue;
    if (apduJSON.listOfValues) {
        messageJSON.propertyId = apduJSON.listOfValues.property.propertyKey;
        messageJSON.propertyValue = apduJSON.listOfValues.propertyValue.propertyValue;
        messageJSON.status = {
            inAlarm: apduJSON.listOfValues.statusFlagsValue.inAlarm,
            fault: apduJSON.listOfValues.statusFlagsValue.fault,
            overridden: apduJSON.listOfValues.statusFlagsValue.overridden,
            outOfService: apduJSON.listOfValues.statusFlagsValue.outOfService
        }
    }

    return messageJSON;
};

function BVLC() {
};

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

BVLC.prototype.read = function (buffer, offset) {
    var bvlc = {};

    bvlc.type = buffer.readUInt8(offset.up());
    bvlc.func = buffer.readUInt8(offset.up());
    bvlc.length = buffer.readUInt16BE(offset.up(2));

    return bvlc;
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

NPDU.prototype.read = function (buffer, offset) {
    var npdu = {};

    npdu.version = buffer.readUInt8(offset.up());

    var control = buffer.readUInt8(offset.up());
    npdu.control = {};
    npdu.control.noApduMessageType = control >> 7;
    npdu.control.reserved1 = (control >> 6) & 0x01;
    npdu.control.destinationSpecifier = (control >> 5) & 0x01;
    npdu.control.reserved2 = (control >> 4) & 0x01;
    npdu.control.sourceSpecifier = (control >> 3) & 0x01;
    npdu.control.expectingReply = (control >> 2) & 0x01;
    npdu.control.priority1 = (control >> 1) & 0x01;
    npdu.control.priority2 = control & 0x01;

    if (npdu.control.destinationSpecifier == 1) {
        npdu.destinationNetworkAddress = buffer.readUInt16BE(offset.up(2));
        npdu.destinationMacLayerAddressLength = buffer.readUInt8(offset.up());
        npdu.hopCount = buffer.readUInt8(offset.up());
    }

    return npdu;
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
    if (dataType == 2) {
        //unsigned int
        buffer.writeUInt8(propertyValue, offset.up(len));
    } else if (dataType == 4) {
        //real/float
        buffer.writeFloatBE(propertyValue, offset.up(len));
    } else if (dataType == 9) {
        //enumerated
        buffer.writeUInt8(propertyValue, offset.up(len));
    } else {
        //unsupported datatype
        buffer.writeUInt8(propertyValue, offset.up(len));
    }
    //closeTag
    apdu.writeTag(buffer, offset, context, 1, 7);
};

APDU.prototype.writeTaggedParameter = function (buffer, offset, context, param) {
    apdu.writeTag(buffer, offset, context, 1, 1);
    buffer.writeUInt8(param, offset.up());
};

APDU.prototype.read = function (buffer, offset, result) {
    var apdu = {};
    var firstByte = buffer.readUInt8(offset.up());
    apdu.type = firstByte >> 4;

    if (apdu.type == 1) {
        //UNCONFIRMED REQUEST
        apdu.serviceChoice = buffer.readUInt8(offset.up());
        if (apdu.serviceChoice == 2) {
            //unconfirmedCOVNotification
            apdu.processId = this.readTaggedParameter(buffer, offset);
            apdu.device = this.readObject(buffer, offset);
            apdu.object = this.readObject(buffer, offset);
            apdu.lifeTime = this.readTaggedParameter(buffer, offset);
            apdu.listOfValues = this.readListOfValues(buffer, offset);
        }
    } else if (apdu.type == 2) {
        //SIMPLE ACK
        apdu.invokeId = buffer.readUInt8(offset.up());
        apdu.serviceChoice = buffer.readUInt8(offset.up());
    } else if (apdu.type == 3) {
        //COMPLEX ACK
        apdu.pduFlags = {};
        apdu.pduFlags.segmentedRequest = (firstByte >> 3) & 0x01;
        apdu.pduFlags.moreSegments = (firstByte >> 2) & 0x01;
        apdu.invokeId = buffer.readUInt8(offset.up());
        apdu.serviceChoice = buffer.readUInt8(offset.up());

        if (apdu.serviceChoice == 12) {
            apdu.object = this.readObject(buffer, offset);
            apdu.property = this.readProperty(buffer, offset);
            apdu.propertyValue = this.readValue(buffer, offset);
        }
    }

    return apdu;
};

APDU.prototype.readTag = function (buffer, offset) {
    var tag = {};
    var byte = buffer.readUInt8(offset.up());
    tag.tagNumber = byte >> 4;
    tag.tagClass = (byte >> 3) & 0x01;
    tag.tagValue = byte & 0x07;
    return tag;
};

APDU.prototype.readObject = function (buffer, offset) {
    var obj = {};
    obj.tag = this.readTag(buffer, offset);
    var bytes = buffer.readUInt32BE(offset.up(4));
    obj.objectType = bytes >> 22;
    obj.objectId = (obj.objectType << 22) ^ bytes;
    return obj;
};

APDU.prototype.readProperty = function (buffer, offset) {
    var property = {};
    property.tag = this.readTag(buffer, offset);
    property.propertyKey = buffer.readUInt8(offset.up());
    return property;
};

APDU.prototype.readValue = function (buffer, offset) {
    var value = {};
    var openTag = this.readTag(buffer, offset);
    value.tag = this.readTag(buffer, offset);
    value.propertyValue;

    if (value.tag.tagNumber == 2) {
        //unsigned int
        value.propertyValue = buffer.readUInt8(offset.up());
    } else if (value.tag.tagNumber == 4) {
        //real/float
        value.propertyValue = buffer.readFloatBE(offset.up(4));
    } else if (value.tag.tagNumber == 8) {
        //bit string
        value.unusedBits = buffer.readUInt8(offset.up());
        var bitString = buffer.readUInt8(offset.up());
        //TODO: look up which exact bit corresponds to which status flag. for now it is in order the first four bits from the left
        value.inAlarm = bitString >> 7;
        value.fault = (bitString >> 6) & 0x01;
        value.overridden = (bitString >> 5) & 0x01;
        value.outOfService = (bitString >> 4) & 0x01;
    } else if (value.tag.tagNumber == 9) {
        //enum/binary
        value.propertyValue = buffer.readUInt8(offset.up());
    } else {
        console.log('Unsupported DataType - Please look up which data type corresponds to the following info');
        value.propertyValue = buffer[offset.up()];
        console.log('propertyValue - (Needs to be converted) ' + value.propertyValue);
    }

    var closeTag = this.readTag(buffer, offset);
    return value;
};

APDU.prototype.readListOfValues = function (buffer, offset) {
    var listOfValues = {};
    var openTag = this.readTag(buffer, offset);
    listOfValues.property = this.readProperty(buffer, offset);
    listOfValues.propertyValue = this.readValue(buffer, offset);
    listOfValues.statusFlags = this.readProperty(buffer, offset);
    listOfValues.statusFlagsValue = this.readValue(buffer, offset);
    var closeTag = this.readTag(buffer, offset);
    return listOfValues;
};

APDU.prototype.readTaggedParameter = function (buffer, offset) {
    var taggedParam = {};
    taggedParam.tag = this.readTag(buffer, offset);
    taggedParam.value = buffer.readUInt8(offset.up());
    return taggedParam;
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