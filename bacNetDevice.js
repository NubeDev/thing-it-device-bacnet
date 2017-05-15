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
        }, {
            id: "name", label: "Name",
            type: {
                id: "string"
            },
            defaultValue: ""
        }, {
            id: "description", label: "Description",
            type: {
                id: "string"
            },
            defaultValue: ""
        }, {
            id: "vendor", label: "Vendor",
            type: {
                id: "string"
            },
            defaultValue: ""
        }, {
            id: "model", label: "Model",
            type: {
                id: "string"
            },
            defaultValue: ""
        }, {
            id: "softwareVersion", label: "Software Version",
            type: {
                id: "string"
            },
            defaultValue: ""
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
                label: "URL",
                id: "url",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "URL Lookup Required",
                id: "urlLookupRequired",
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
            }, {
                label: "Omit WhoIs Confirmation",
                id: "omitWhoIsConfirmation",
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
        "use strict";
        var promise;
        this.state = {};

        try {
            this.logDebug("Simulated: " + this.isSimulated());

            if (this.isSimulated()) {
                this.logDebug("Starting BACnet in simulated mode.");
                this.state.initialized = true;
                promise = q();
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

                promise = this.getIp()
                    .then(function () {
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

                        var intermediatePromise = this.adapter.initialize(this.bacNetDevice);

                        if (!this.configuration.omitWhoIsConfirmation) {
                            intermediatePromise = intermediatePromise.then(function (device) {
                                this.logDebug('Performing WhoIs confirmation.');
                                return this.adapter.confirmViaWhoIs(device);
                            }.bind(this));
                        } else {
                            this.logDebug('Omitting WhoIs confirmation.');
                        }

                        promise = intermediatePromise.then(function (bacNetDevice) {
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
                        }.bind(this));

                    }.bind(this))
                    .fail(function (e) {
                        this.logError(e);
                        return q.fail(e);
                    }.bind(this));
            }

        } catch (e) {
            this.logError('Error during start.', e);
            promise = q.fcall(function () {
                throw new Error(e);
            });
        }

        return promise;
    };

    BacNet.prototype.getIp = function () {
        "use strict";
        var promise;

        if ((this.configuration.url) && (this.configuration.urlLookupRequired)) {
            var dns = require('dns');
            var deferred = q.defer();

            dns.lookup(this.configuration.url, function (err, address, family) {
                if (err) {
                    this.logDebug('Error trying to look up URL "' + this.configuration.url + '"', err);
                    deferred.reject(err);
                } else {
                    this.configuration.ipAddress = address;
                    deferred.resolve(address);
                    this.logDebug('Retrieved IP address for URL.', address, this.configuration.url);
                }
            }.bind(this));

            promise = deferred.promise;
        } else if ((!this.configuration.ipAddress) || ('' === this.configuration.ipAddress)) {
            this.configuration.ipAddress = 'GENERATED_' + Math.round(Math.random() * 10000000);
            this.logDebug('IP address not configured, using ' + this.configuration.ipAddress);
            promise = q(this.configuration.ipAddress);
        } else {
            promise = q(this.configuration.ipAddress);
        }

        return promise;
    }

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

