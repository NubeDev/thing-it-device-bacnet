module.exports = {
    metadata: {
        family: 'bacnet',
        plugin: 'bacNetDevice',
        label: 'BACnet Device',
        manufacturer: '',
        discoverable: true,
        additionalSoftware: [],
        actorTypes: [],
        sensorTypes: [],
        services: [],
        state: [{
            id: "initialized", label: "Initialized",
            type: {
                id: "boolean"
            }
        }
        ],
        configuration: [
            {
                label: "IP Address",
                id: "ipAddress",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "IP Match Required",
                id: "ipMatchRequired",
                type: {
                    id: "boolean"
                },
                defaultValue: ""
            }, {
                label: "Port",
                id: "port",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "BACnet-ID",
                id: "bacNetId",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Device-ID",
                id: "deviceId",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Device-ID Match Required",
                id: "deviceIdMatchRequired",
                type: {
                    id: "boolean"
                },
                defaultValue: ""
            }, {
                label: "Vendor-ID",
                id: "vendorId",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Vendor-ID Match Required",
                id: "vendorIdMatchRequired",
                type: {
                    id: "boolean"
                },
                defaultValue: ""
            }
        ]
    },
    create: function () {
        return new BacNet();
    },
    discovery: function () {
        return new BacNetDiscovery();
    }
};

var q = require('q');
var BacNetAdapter = require('./lib/bacNetAdapter.js');

/**
 *
 * @constructor
 */
function BacNetDiscovery() {
    /**
     *
     * @param options
     */
    BacNetDiscovery.prototype.start = function () {
        this.objects = [];

        if (this.node.isSimulated()) {
            this.timer = setInterval(function () {
            }.bind(this), 20000);


        } else {
            //TODO: Put in BacNet connector here that can access a BacNet via its API

            //TODO: add bacnet objects / actors via discovery (have a look how it's done in z-wave).

            //TODO: the procedure is to 1) scan the bacnet over the bacnet gateway for objects and 2) to create an actor for each object

            this.logLevel = 'debug';
        }
    };

    /**
     *
     * @param options
     */
    BacNetDiscovery.prototype.stop = function () {
        if (this.timer) {
            clearInterval(this.timer);
        }
    };
}

/**
 *
 * @constructor
 */
function BacNet() {
    /**
     *
     */
    BacNet.prototype.start = function () {
        var deferred = q.defer();
        this.state = {};

        try {
            this.logDebug("Simulated: " + this.isSimulated());

            if (this.isSimulated()) {
                this.logDebug("Starting BACnet in simulated mode.");
                this.state.initialized = true;
                deferred.resolve();
            } else {
                this.logDebug("Starting BACnet in non-simulated mode.");
                //this.logDebug(this.configuration);

                this.state.initialized = false;
                var port = parseInt(this.configuration.port);

                if ((!port) || (port < 1024) || (port > 65536)) {
                    this.logDebug('Configured port "' + this.configuration.port +
                        '" is out of range (1024-65536). Defaulting to port ' +
                        BacNetAdapter.BACNET_DEFAULT_PORT + '.');
                    this.configuration.port = BacNetAdapter.BACNET_DEFAULT_PORT;
                } else {
                    this.configuration.port = port;
                }

                if ((!this.configuration.ipAddress) || ('' === this.configuration.ipAddress)){
                    this.configuration.ipAddress = 'GENERATED_'+ Math.round(Math.random() * 10000000);
                    this.logDebug('IP address not configured, using ' + this.configuration.ipAddress);
                }

                var matchCriteria = {};

                if (this.configuration.ipMatchRequired) {
                    matchCriteria.ip = this.configuration.ipAddress;
                }

                if (this.configuration.deviceIdMatchRequired) {
                    matchCriteria.objectId = parseInt(this.configuration.deviceId);
                }

                if (this.configuration.vendorIdMatchRequired) {
                    matchCriteria.vendorId = this.configuration.vendorId;
                }

                this.bacNetDevice = BacNetAdapter.createDevice(
                    this.configuration.ipAddress + ':' + this.configuration.port,
                    this.configuration.ipAddress,
                    this.configuration.port,
                    parseInt(this.configuration.deviceId),
                    this.configuration.vendorId,
                    matchCriteria);
                this.adapter = BacNetAdapter.create();

                this.adapter.initialize(this.bacNetDevice)
                    .then(function (bacNetDevice) {
                        this.logInfo('Initialized BACnet device successfully.');
                        this.logDebug('Device details: ', bacNetDevice);

                        var newId = bacNetDevice.ip + ':' + bacNetDevice.port;

                        if (newId !== bacNetDevice.id) {
                            if (bacNetDevice.id.indexOf('GENERATED_') > -1) {
                                this.logInfo('Device ID not configured, found at ' + newId);
                            } else {
                                this.logInfo('Device configured with ' + bacNetDevice.id + ' found at ' + newId);
                            }
                            bacNetDevice.id = newId;
                        }

                        this.bacNetDevice = bacNetDevice;
                        this.state.initialized = true;
                        deferred.resolve();
                    }.bind(this))
                    .fail(function (e) {
                        this.logError(e);
                        deferred.reject(e);
                    }.bind(this));
            }

        } catch (e) {
            this.logError('Error during start.', e);
            deferred.reject(e);
        }

        return deferred.promise;
    };

    /**
     *
     */
    BacNet.prototype.stop = function () {
        var deferred = q.defer();

        if (this.isSimulated()) {
            this.logDebug("Stopping BACnet in simulated mode.");
        } else {
            this.adapter.release(this.bacNetDevice)
                .then(function () {
                    deferred.resolve();
                }.bind(this))
                .fail(function (e) {
                    this.logError(e);
                    deferred.reject(e);
                }.bind(this));
        }

        deferred.resolve();

        return deferred.promise;
    };

    /**
     *
     */
    BacNet.prototype.getState = function () {
        return {};
    };

    /**
     *
     */
    BacNet.prototype.setState = function () {
    };
}

