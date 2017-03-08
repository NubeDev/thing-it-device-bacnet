module.exports = {
    create: function () {
        return new BACnetAdapter();
    }
};

var dgram = require('dgram');

var q = require('q');
var _ = require('underscore');

/**
 *
 * @constructor
 */
function BACnetAdapter() {
}

//TODO: try if it could also work to not statically assign port and host to the adapter/client
/**
 * @param host
 * @param port
 */
BACnetAdapter.prototype.initialize = function (port, host) {
    console.log('adapter initialize');
    this.TIMEOUT = 10000;
    this.udpClient = dgram.createSocket('udp4');
    this.udpClient.bind(port, host);

    this.requests = [];
    this.listeners = [];

    this.udpClient.on('message', function (message, remote) {
        console.log(remote.address + ':' + remote.port + ' - ' + message);

        //buffer -> string -> JSON
        var messageBody = message.toString('utf-8');
        console.log(messageBody); //utf-8 is the default
        var messageJSON = JSON.parse(messageBody);
        console.log(messageJSON);

        if (messageJSON.type == 'R') {
            //matching back request
            console.log('try matching request');
            var matchingRequest = _.find(this.requests, {time: messageJSON.time});

            if (matchingRequest) {
                console.log('found request');
                console.log(messageJSON.response);
                matchingRequest.resolve(message);
            }
        } else if (messageJSON.type == 'L') {
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
    this.udpClient.close();
}

/**
 * Generic request send
 *
 * @param request
 * @returns {*}
 */
BACnetAdapter.prototype.sendRequest = function (request, port, host) {
    console.log('adapter send request');
    var deferred = q.defer();

    this.requests.push(request);

    request.deferred = deferred;
    request.adapter = this;

    this.udpClient.send(request.messageBody, 0, request.messageBody.length, port, host, function (err, bytes) {
        if (err) {
            this.adapter.requests = _.without(this.adapter.requests, this);

            throw err;
        }

        request.startWaiting(this.TIMEOUT);

        console.log('UDP Client message sent to ' + port + ':' + host);
    }.bind(this));

    return deferred.promise;
};

/**
 *
 * @returns {*}
 */
BACnetAdapter.prototype.sendXRequest = function (port, host) {
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

    return this.sendRequest(request, port, host);
};

/**
 *
 * @returns {*}
 */
BACnetAdapter.prototype.sendYRequest = function (message, port, host) {
    console.log('adapter send y request');
    //var request = new Request().initialize();
    var request = new Request().initialize();
    request.message = message;

    // TODO Some Y-specific marshalling happens here

    return this.sendRequest(request, port, host);
};

BACnetAdapter.prototype.registerListener = function (listener, port, host) {
    console.log('adapter register listener');
    //var deferred = q.defer();

    this.listeners.push(listener);

    //listener.deferred = deferred;
    listener.adapter = this;

    this.udpClient.send(listener.messageBody, 0, listener.messageBody.length, port, host, function (err, bytes) {
        if (err) {
            this.adapter.listeners = _.without(this.adapter.listeners, this);

            throw err;
        }

        //request.startWaiting(this.TIMEOUT);

        console.log('UDP Client message sent to ' + port + ':' + host);
    }.bind(this));

    //return deferred.promise;
};

BACnetAdapter.prototype.registerXListener = function (port, host) {
    console.log('adapter register x listener');

    var listener = new Listener();
    listener.resource = 'tea';

    // TODO Some X-specific marshalling happens here
    var body = {
        time: listener.time,
        type: listener.type,
        resource: listener.resource,
        action: 'link'
    };

    console.log(body);
    listener.messageBody = JSON.stringify(body);
    console.log(listener.messageBody);

    return this.registerListener(listener, port, host);
};

BACnetAdapter.prototype.unregisterListener = function (listener, port, host) {
    console.log('adapter unregister listener');
};

/**
 *
 * @constructor
 */
function Request() {
    var d = new Date();
    this.time = d.getTime();
    this.type = 'R';
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
    this.type = 'L';
}

Request.prototype.initialize = function () {
};