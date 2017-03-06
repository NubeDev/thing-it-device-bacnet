var dgram = require('dgram');
var PORT = 33333;
var HOST = '127.0.0.1';

/**
 *
 * @constructor
 */
function Adapter() {
}

/**
 *
 * @param host
 * @param port
 */
Adapter.prototype.initialize = function (host, port) {
    this.TIMEOUT = 10000;
    this.port = port;
    this.host = host;
    this.udpServer = dgram.createSocket('udp4');
    this.udpClient = dgram.createSocket('udp4');

    this.requests = [];
    this.listeners = [];

    this.udpServer.on('listening', function () {
        var address = this.udpServer.address();

        console.log('UDP Server listening on ' + address.address + ":" + address.port);
    });
    this.udpServer.on('message', function (message, remote) {
        console.log(remote.address + ':' + remote.port + ' - ' + message);

        // Find matching request

        var matchingRequest = _.find(this.requests, {id: message.id});

        if (matchingRequest) {
            matchingRequest.resolve(message);
        }

        for (var n in this.listeners) {
            if (this.listeners[n] ...) {
                // TODO Some unmarshalling can happen here

                this.listeners.callback(message);
            }
        }
    });

    this.udpServer.bind(this.port, this.host);
};

/**
 * Generic request send
 *
 * @param request
 * @returns {*}
 */
Adapter.prototype.sendRequest = function (request) {
    var deferred = q.defer();

    this.requests.push(request);

    request.deferred = deferred;
    request.adapter = this;

    this.udpClient.send(message, 0, message.length, PORT, HOST, function (err, bytes) {
        if (err) {
            _.pull(this.requests, request);

            throw err;
        }

        request.startWaiting(this.TIMEOUT);

        console.log('UDP message sent to ' + HOST + ':' + PORT);

        this.udpClient.close();
    }.bind(this));

    return deferred.promise();
};

/**
 *
 * @returns {*}
 */
Adapter.prototype.sendXRequest = function () {
    var request = new Request().initialize();

    // TODO Some X-specific marshalling happens here

    return this.sendRequest(request);
};

/**
 *
 * @returns {*}
 */
Adapter.prototype.sendYRequest = function () {
    var request = new Request().initialize();

    // TODO Some Y-specific marshalling happens here

    return this.sendRequest(request);
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
    this.timeout = setTimeout(function () {
        _.pull(this.adapter.requests, this);

        this.deferred.reject('Got a big timeout.');
    }.bind(this), timeout);
};

/**
 *
 * @param message
 */
Request.prototype.resolve = function (message) {
    clearTimeout(this.timeout);

    _.pull(this.adapter.requests, this);

    this.deferred.resolve(message);
};