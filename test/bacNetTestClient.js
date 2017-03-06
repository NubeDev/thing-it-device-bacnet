var PORT = 33333;
var HOST = '127.0.0.1';

var dgram = require('dgram');

var server = dgram.createSocket('udp4');

function Adapter() {
}

Adapter.prototype.initialize = function() {
    this.udpServer = dgram.createSocket('udp4');
    this.udpClient = dgram.createSocket('udp4');

    this.requests = [];

    this.udpServer.on('listening', function () {
        var address = server.address();
        console.log('UDP Server listening on ' + address.address + ":" + address.port);
    });
    this.udpServer.on('message', function (message, remote) {
        console.log(remote.address + ':' + remote.port + ' - ' + message);

        // Find matching request

        var matchingRequest = _.find(this.requests, {id: message.id});

        if (matchingRequest) {
            matchingRequest.resolve(message);
        }

    });
}

Adapter.prototype.sendXRequest = function() {
    var deferred = q.defer();
    var request = new Request().initialize(this, deferred);

    this.requests.push(request);

    this.udpClient.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
        if (err) {
            _.pull(this.requests, request);

            throw err;
        }

        console.log('UDP message sent to ' + HOST +':'+ PORT);

        this.udpClient.close();
    }.bind(this));

    return deferred.promise();
};


function Request() {
}

Request.prototype.initialize = function(adapter, deferred){
    this.TIMEOUT = 10000;
    this.adapter = adapter;
    this.deferred = deferred;
    this.timeout = setTimeout(function(){
        _.pull(this.adapter.requests, this);

        this.deferred.reject('Got a big timeout.');
    }.bind(this), this.TIMEOUT);
}

Request.prototype.resolve = function(message){
    clearTimeout(this.timeout);

    this.deferred.resolve(message);
}