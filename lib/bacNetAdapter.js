module.exports = {
    create: function (device) {
        return new BACnetAdapter(device);
    }
};

var dgram = require('dgram');
var q = require('q');
var _ = require('underscore');

/**
 *
 * @constructor
 */
function BACnetAdapter(device) {
    this.device = device;

    //47808 is the default UDP port of BACnet,
    this.bacnet = {
        port: 47808,
        host: this.device.configuration.ipAddress,
        bacNetId: this.device.configuration.bacNetId,
        deviceId: this.device.configuration.deviceId
    };
}

/**
 * @param host
 * @param port
 */
BACnetAdapter.prototype.initialize = function () {
    console.log('adapter initialize');
    this.TIMEOUT = 10000;
    this.udpClient = dgram.createSocket('udp4');

    //this.udpClient.bind(port, host);

    this.requests = [];
    this.listeners = [];

    this.udpClient.on('message', function (message, remote) {
        console.log(remote.address + ':' + remote.port + ' - ' + message);

        //buffer -> string -> JSON
        var messageBody = message.toString('utf-8');
        console.log(messageBody); //utf-8 is the default
        var messageJSON = JSON.parse(messageBody);
        console.log(messageJSON);

        if (messageJSON.type == 'R' || messageJSON.type == 'RP' || messageJSON.type == 'WP') {
            //matching back request
            console.log('try matching request');
            var matchingRequest = _.find(this.requests, {time: messageJSON.time});

            if (matchingRequest) {
                console.log('found request');
                matchingRequest.resolve(messageJSON);
            }
        }

        if (messageJSON.type == 'SCOV') {
            //matching back listener
            console.log('try matching listener');
            //TODO: also here implement better matching
            var matchingListener = _.find(this.listeners, {propertyId: messageJSON.propertyId});

            if (matchingListener) {
                console.log('found listener');
                matchingListener.resolve(messageJSON);
            }
        }

        if (messageJSON.type == 'CCOVN') {
            //matching back listener
            console.log('try matching notification');
            //TODO: also here implement better matching
            var matchingListener = _.find(this.listeners, {propertyId: messageJSON.propertyId});

            if (matchingListener) {
                console.log('received notification for listener ' + messageJSON.propertyId +  ' -> calling back ...');
                matchingListener.callback(messageJSON);
            }
        }

        if (messageJSON.type == 'L') {
            //matching back listener
            console.log('try matching listener');
            var matchingListener = _.find(this.listeners, {resource: messageJSON.resource});

            if (matchingListener) {
                console.log('found listener');

                if (messageJSON.data) {
                    console.log(messageJSON.data);
                }
            }
        }

    }.bind(this));
};

BACnetAdapter.prototype.stop = function () {
    console.log('adapter stop');
    this.udpClient.close();
}

/**
 * Generic request send
 *
 * @param request
 * @returns {*}
 */
BACnetAdapter.prototype.sendRequest = function (request) {
    console.log('adapter send request');
    var deferred = q.defer();

    this.requests.push(request);

    request.deferred = deferred;
    request.adapter = this;

    this.udpClient.send(request.messageBody, 0, request.messageBody.length, this.bacnet.port, this.bacnet.host, function (err, bytes) {
        if (err) {
            this.adapter.requests = _.without(this.adapter.requests, this);

            throw err;
        }

        request.startWaiting(this.TIMEOUT);

        console.log('UDP Client message sent to ' + this.bacnet.host + ':' + this.bacnet.port);
    }.bind(this));

    return deferred.promise;
};

/**
 *
 * @returns {*}
 */
BACnetAdapter.prototype.readProperty = function (objectId, propertyId) {
    console.log('adapter - write property');
    var request = new Request();

    var body = {
        time: request.time,
        type: 'RP',
        bacNetId: this.bacnet.bacNetId,
        deviceId: this.bacnet.deviceId,
        objectId: objectId,
        propertyId: propertyId
    };

    request.messageBody = JSON.stringify(body);

    return this.sendRequest(request);
};

/**
 *
 * @returns {*}
 */
BACnetAdapter.prototype.writeProperty = function (objectId, propertyId, propertyValue) {
    console.log('adapter - write property');
    var request = new Request();

    var body = {
        time: request.time,
        type: 'WP',
        bacNetId: this.bacnet.bacNetId,
        deviceId: this.bacnet.deviceId,
        objectId: objectId,
        propertyId: propertyId,
        propertyValue: propertyValue
    };

    request.messageBody = JSON.stringify(body);

    return this.sendRequest(request);
};

/**
 *
 * @returns {*}
 */
BACnetAdapter.prototype.sendXRequest = function () {
    console.log('adapter send x request');
    var request = new Request();
    request.message = 'i like tea';

    var body = {
        time: request.time,
        type: 'R',
        message: request.message
    };

    request.messageBody = JSON.stringify(body);

    return this.sendRequest(request);
};

BACnetAdapter.prototype.registerListener = function (listener) {
    console.log('adapter register listener');
    var deferred = q.defer();

    this.listeners.push(listener);

    listener.deferred = deferred;
    listener.adapter = this;

    this.udpClient.send(listener.messageBody, 0, listener.messageBody.length, this.bacnet.port, this.bacnet.host, function (err, bytes) {
        if (err) {
            this.adapter.listeners = _.without(this.adapter.listeners, this);

            throw err;
        }

        listener.startWaiting(this.TIMEOUT);

        console.log('UDP Client message sent to ' + this.bacnet.host + ':' + this.bacnet.port);
    }.bind(this));

    return deferred.promise;
};

BACnetAdapter.prototype.subscribeCOV = function (objectId, propertyId, callback) {
    console.log('adapter subscribe to change of value');
    var listener = new Listener();
    listener.objectId = objectId;
    listener.propertyId = propertyId
    listener.callback = callback;

    var body = {
        time: listener.time,
        type: 'SCOV',
        bacNetId: this.bacnet.bacNetId,
        deviceId: this.bacnet.deviceId,
        objectId: objectId,
        propertyId: propertyId
    };

    listener.messageBody = JSON.stringify(body);

    return this.registerListener(listener);
};

BACnetAdapter.prototype.registerXListener = function () {
    console.log('adapter register x listener');

    var listener = new Listener();
    listener.resource = 'tea';

    var body = {
        time: listener.time,
        type: 'L',
        resource: listener.resource,
        action: 'link'
    };

    listener.messageBody = JSON.stringify(body);

    return this.registerListener(listener);
};

BACnetAdapter.prototype.unregisterListener = function (listener) {
    console.log('adapter unregister listener');
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
    this.deferred.resolve(message);
};

//the listener asks to listen to a BACnet resource, which can be a device, an object,
//or a property
//the address to that resource looks as follows:
//IP+BACnet-ID+Device-ID+Object-ID+Property-ID
function Listener() {
    var d = new Date();
    this.time = d.getTime();
}

Listener.prototype.initialize = function () {
};

/**
 *
 * @param message
 */
Listener.prototype.startWaiting = function (timeout) {
    console.log('listener start waiting');

    //add timeout
    this.timeout = setTimeout(function () {
        //Remove request
        this.adapter.listeners = _.without(this.adapter.listeners, this);
        this.deferred.reject('Got a big timeout.');
    }.bind(this), timeout);
};

/**
 *
 * @param message
 */
Listener.prototype.resolve = function (message) {
    console.log('listener resolve after initial subscribtion request');
    clearTimeout(this.timeout);
    console.log(message);
    //add what happens with listener like leaving it in or taking it out, because it already exists
    this.deferred.resolve(message);
};