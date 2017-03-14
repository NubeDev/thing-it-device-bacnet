module.exports = {
    create: function (device) {
        return new BACnetAdapter(device);
    }
};

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
    Schedule: 17
};

const BACNET_DEFAULT_PORT = 47808;

var dgram = require('dgram');
var q = require('q');
var _ = require('underscore');
var bs = require('node-bacnet-master');

/**
 *
 * @constructor
 */
function BACnetAdapter(device) {
    this.device = device;

    this.bacnetStack = bs.init({
        datalink: {
            iface: 'bridge100',
            ip_port: 0xBAC0
        },
        device: false
    })
}

/**
 * @param host
 * @param port
 */
BACnetAdapter.prototype.initialize = function () {
    console.log('adapter initialize');
    this.requests = [];
    this.listeners = [];

    this.TIMEOUT = 10000;

    //++++++++++++++++++++++++++++++++++++++++++++++
    //BacNet Stack Implementation - npm node-bacnet-master
    this.bacnetStack.on('iam', function (iam) {
        console.log('iam: ', iam);
    });

    this.bacnetStack.on('read-property-ack', function (property) {
        console.log(property);
        console.log(property.value[0]);

        //matching back request
        console.log('try matching request');
        //console.log(this.requests);
        //TODO: matching needs to be improved
        var matchingRequest = _.find(this.requests, function(r) {
            //console.log('-' + r.message.objectId + '-');
            //console.log('-' + property.object.instance + '-');
            return r.message.objectId == property.object.instance;
        });

        console.log(matchingRequest);

        if (matchingRequest) {
            console.log('found request');
            matchingRequest.message.propertyValue = property.value;
            matchingRequest.resolve(matchingRequest.message);
        }
    }.bind(this));

    //if a ipAddress is put in the who is the bacnet device is addressed directly
    this.bacnetStack.whois(this.device.configuration.ipAddress);

    //++++++++++++++++++++++++++++++++++++++++++++++
    //Our UDP Implementation
    /*
    this.udpClient = dgram.createSocket('udp4');

    //this.udpClient.bind(port, host);

    this.udpClient.on('message', function (message, remote) {
        console.log(remote.address + ':' + remote.port + ' - ' + message);

        //buffer -> string -> JSON
        var messageBody = message.toString('utf-8');
        console.log(messageBody); //utf-8 is the default
        var messageJSON = JSON.parse(messageBody);
        console.log(messageJSON);

        if (messageJSON.type == 'RP'
            || messageJSON.type == 'WP'
            || messageJSON.type == 'SCOV'
            || messageJSON.type == 'USCOV') {
            //matching back request
            console.log('try matching request');
            //console.log(this.requests);
            var matchingRequest = _.find(this.requests, {time: messageJSON.time});

            if (matchingRequest) {
                console.log('found request');
                matchingRequest.resolve(messageJSON);
            }
        }

        if (messageJSON.type == 'CCOVN') {
            //matching back listener
            console.log('try matching notification');
            //TODO: also here implement better matching
            var matchingListener = _.find(this.listeners, {objectId: messageJSON.objectId, propertyId: messageJSON.propertyId});

            if (matchingListener) {
                console.log('received notification for listener ' + messageJSON.objectId + ' ' + messageJSON.propertyId +  ' -> calling back ...');
                matchingListener.callback(messageJSON);
            }
        }

    }.bind(this));
    */
};

BACnetAdapter.prototype.stop = function () {
    console.log('adapter stop');
    //this.udpClient.close();
    this.bacnetStack.closeQueue();
}

/**
 * Generic request send
 *
 * @param request
 * @returns {*}
 */
BACnetAdapter.prototype.sendRequest = function (messageJSON, callback) {
    console.log('adapter send request');
    var deferred = q.defer();

    var request = new Request();
    request.deferred = deferred;
    request.adapter = this;
    //request.messageBody = JSON.stringify(messageJSON);
    request.message = messageJSON;
    request.time = messageJSON.time;
    if (callback) {
        request.callback = callback;
    }

    this.requests.push(request);

    //r.readProperty(String ipAddress deviceId,Number objectTypeKey,Number objectId,String propertyName, Number arrayIndex)
    this.bacnetStack.readProperty(this.device.configuration.ipAddress, messageJSON.objectType, messageJSON.objectId, messageJSON.propertyId, false, function (err, bytes) {

    //this.udpClient.send(request.messageBody, 0, request.messageBody.length, this.bacnet.port, this.bacnet.host, function (err, bytes) {
        if (err) {
            this.adapter.requests = _.without(this.adapter.requests, this);

            throw err;
        }

        request.startWaiting(this.TIMEOUT);

        console.log('UDP Client message sent to ' + this.device.configuration.ipAddress + ':' + BACNET_DEFAULT_PORT);
    }.bind(this));

    return deferred.promise;
};

/**
 *
 * @returns {*}
 */
BACnetAdapter.prototype.readProperty = function (objectType, objectId, propertyId) {
    console.log('adapter - read property');

    var messageJSON = {
        time: (new Date()).getTime(),
        type: 'RP',
        objectType: BACNET_OBJECT_TYPES[objectType],
        objectId: objectId,
        propertyId: propertyId
    };

    return this.sendRequest(messageJSON);
};

/**
 *
 * @returns {*}
 */
BACnetAdapter.prototype.writeProperty = function (objectId, propertyId, propertyValue) {
    console.log('adapter - write property');

    var messageJSON = {
        time: (new Date()).getTime(),
        type: 'WP',
        objectId: objectId,
        propertyId: propertyId,
        propertyValue: propertyValue
    };

    return this.sendRequest(messageJSON);
};

BACnetAdapter.prototype.subscribeCOV = function (objectId, propertyId, callback) {
    console.log('adapter subscribe to change of value');
    var listener = new Listener();
    listener.time = (new Date()).getTime();
    listener.adapter = this;
    listener.objectId = objectId;
    listener.propertyId = propertyId;
    listener.callback = callback;

    var messageJSON = {
        time: listener.time,
        type: 'SCOV',
        objectId: objectId,
        propertyId: propertyId
    };

    return this.sendRequest(messageJSON, listener.register());
};

BACnetAdapter.prototype.unsubscribeCOV = function (objectId, propertyId) {
    console.log('adapter unsubscribe to change of value');
    var matchingListener = _.find(this.listeners, {objectId: objectId, propertyId: propertyId});

    var messageJSON = {
        time: (new Date()).getTime(),
        type: 'USCOV',
        objectId: objectId,
        propertyId: propertyId
    };

    if (matchingListener) {
        return this.sendRequest(messageJSON, matchingListener.unregister());
    } else {
        return this.sendRequest(messageJSON);
    }
};

/**
 *
 * @constructor
 */
function Request() {
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

    //add timeout
    this.timeout = setTimeout(function () {
        //Remove request
        this.adapter.requests = _.without(this.adapter.requests, this);
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
    if (this.callback) {
        this.callback();
    }
    this.deferred.resolve(message);
};

function Listener() {
}

Listener.prototype.initialize = function () {
};

/**
 *
 * @param message
 */
Listener.prototype.register = function () {
    console.log('add listener to listeners');
    this.adapter.listeners.push(this);
};

/**
 *
 * @param message
 */
Listener.prototype.unregister = function () {
    console.log('remove listener from listeners');
    this.adapter.listeners = _.without(this.adapter.listeners, this);
};