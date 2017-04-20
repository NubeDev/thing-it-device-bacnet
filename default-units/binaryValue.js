module.exports = {
    metadata: {
        plugin: "binaryValue",
        label: "BacNet Binary Value",
        role: "actor",
        family: "binaryValue",
        deviceTypes: ["bacnet/bacNetDevice"],
        services: [{
            id: "on",
            label: "On"
        }, {
            id: "off",
            label: "Off"
        }, {
            id: "toggle",
            label: "Toggle"
        }],

        state: [
            {
                id: "presentValue", label: "Present Value",
                type: {
                    id: "boolean"
                }
            }, {
                id: "alarmValue", label: "Alarm Value",
                type: {
                    id: "boolean"
                }
            }, {
                id: "outOfService", label: "Out of Service",
                type: {
                    id: "boolean"
                }
            }],
        configuration: [
            {
                label: "Object Identifier",
                id: "objectId",
                type: {
                    id: "string"
                },
                defaultValue: ""
            },
            {
                label: "Object Type",
                id: "objectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            },
            {
                label: "Object Name",
                id: "objectName",
                type: {
                    id: "string"
                },
                defaultValue: ""
            },
            {
                label: "Description",
                id: "description",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }
        ]
    },
    create: function () {
        return new BinaryValue();
    }
};

var q = require('q');
const OBJECT_TYPE = 'BinaryValue';

/**
 *
 */
function BinaryValue() {
    /**
     *
     */
    BinaryValue.prototype.start = function () {
        this.logDebug("BINARY VALUE START");
        var deferred = q.defer();
        this.isSubscribed = false;

        this.logDebug("BINARY VALUE START - change state");
        this.state = {
            presentValue: false,
            alarmValue: false,
            outOfService: false
        };

        this.logDebug("BINARY VALUE START - check if simulated");
        if (this.isSimulated()) {
            this.logDebug("BINARY VALUE START - in simulation");
            this.simulationIntervals = [];

            this.simulationIntervals.push(setInterval(function () {
                if (Math.random() > 0.6) {
                    this.toggle();
                }
            }.bind(this), 10000));

            this.simulationIntervals.push(setInterval(function () {
                this.state.alarmValue = Math.random() >= 0.5;
                this.logDebug("alarmValue: " + this.state.alarmValue);
                this.logDebug(this.state);
                this.publishStateChange();

                if (this.state.alarmValue == true) {
                    this.logDebug("BINARY VALUE SIMULATION - publish event because of alarm");
                    this.device.publishEvent('Warning', {details: 'Something is not normal here.'});
                }
            }.bind(this), 17000));

            this.simulationIntervals.push(setInterval(function () {
                this.state.outOfService = Math.random() >= 0.5;
                this.logDebug("outOfService: " + this.state.outOfService);
                this.logDebug(this.state);
                this.publishStateChange();

                if (this.state.outOfService == true) {
                    this.logDebug("BINARY VALUE SIMULATION - change operational state to notReachable");
                    this.operationalState = {state: 'notReachable'};
                } else {
                    this.logDebug("BINARY VALUE SIMULATION - change operational state to normal");
                    this.operationalState = {state: 'normal'};
                }
                this.publishOperationalStateChange();
            }.bind(this), 61000));

            deferred.resolve();
        } else {
            this.logDebug("Starting in non-simulated mode");
            this.logDebug("Subscribing to COV");
            this.device.adapter.subscribeCOV(OBJECT_TYPE, this.configuration.objectId,
                this.device.configuration.ipAddress, this.device.configuration.port, function (notification) {
                this.logDebug('received notification');
                if (notification.propertyValue == 1) {
                    this.state.presentValue = true;
                } else {
                    this.state.presentValue = false;
                }
                this.logDebug("presentValue: " + this.state.presentValue);
                this.logDebug("State", this.state);
                this.publishStateChange();
            }.bind(this))
                .then(function(result) {
                    this.logDebug('Successfully subscribed to COV of presentValue on object ' + this.configuration.objectId);
                    this.isSubscribed = true;
                    deferred.resolve();
                }.bind(this))
                .fail(function(result) {
                    var errorMessage = 'Could not subscribe to COV of presentValue on object '
                        + this.configuration.objectId + ': ' + result;
                    this.logError(errorMessage);
                    deferred.reject(errorMessage);
                }.bind(this));
        }



        return deferred.promise;
    };

    /**
     *
     */
    BinaryValue.prototype.stop = function () {
        this.logDebug('Stopping.');
        var deferred = q.defer();

        if (this.isSimulated()) {
            if (this.simulationIntervals) {
                for (interval in this.simulationIntervals) {
                    clearInterval(this.simulationIntervals[interval]);
                }
            }

            deferred.resolve();
        } else {
            this.logDebug("Attempting to un-subscribe from updates for present value.");

            this.device.adapter.unsubscribeCOV(OBJECT_TYPE, this.configuration.objectId,
                this.device.configuration.ipAddress, this.device.configuration.port)
                .then(function (result) {
                    this.logDebug('Successfully un-subscribed to COV of presentValue on object ' + this.configuration.objectId);
                    deferred.resolve();
                }.bind(this))
                .fail(function (result) {
                    var errorMessage = 'Could not un-subscribe to COV of presentValue on object '
                        + this.configuration.objectId + ': ' + result;
                    deferred.reject(new Error(errorMessage));
                }.bind(this));
        }

        return deferred.promise;
    };

    /**
     *
     */
    BinaryValue.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    BinaryValue.prototype.setState = function (state) {
        if (state.presentValue) {
            this.on();
        } else {
            this.off();
        }
    };

    /**
     *
     */
    BinaryValue.prototype.update = function () {
        var deferred = q.defer();

        this.logDebug("Called update()");

        if (this.isSimulated()) {
            this.logDebug("State", this.state);
            this.publishStateChange();

            deferred.resolve();
        } else {
            this.device.adapter.readProperty(OBJECT_TYPE, this.configuration.objectId, 'presentValue',
                this.device.configuration.ipAddress, this.device.configuration.port)
                .then(function(result) {
                    if (result.propertyValue == 1) {
                        this.state.presentValue = true;
                    } else {
                        this.state.presentValue = false;
                    }
                    this.logDebug("presentValue: " + this.state.presentValue);
                    this.logDebug("State", this.state);
                    this.publishStateChange();

                    deferred.resolve();
                }.bind(this))
                .fail(function(result) {
                    var errorMessage = 'Error trying to update.';
                    this.logError(errorMessage);
                    deferred.reject(errorMessage);
                }.bind(this));
        }

        return deferred.promise;
    };

    /**
     *
     */
    BinaryValue.prototype.setPresentValue = function (presentValue) {
        var deferred = q.defer();

        this.logDebug("Called setPresentValue()");

        if (this.isSimulated()) {
            this.state.presentValue = presentValue;
            this.logDebug("presentValue: " + this.state.presentValue);
            this.logDebug("State", this.state);
            this.publishStateChange();

            deferred.resolve();
        } else {
            if (presentValue == true) {
                presentValue = 1;
            } else {
                presentValue = 0;
            }

            this.device.adapter.writeProperty(OBJECT_TYPE, this.configuration.objectId, 'presentValue', presentValue,
                this.device.configuration.ipAddress, this.device.configuration.port)
                .then(function(result) {
                    if (!this.isSubscribed) {
                        if (result.propertyValue == 1) {
                            this.state.presentValue = true;
                        } else {
                            this.state.presentValue = false;
                        }
                        this.logDebug("presentValue: " + this.state.presentValue);
                        this.logDebug("State", this.state);
                        this.publishStateChange();
                    }

                    deferred.resolve();
                }.bind(this))
                .fail(function(result) {
                    var errorMessage = 'Error trying to set value to "' + presentValue + '"';
                    this.logError(errorMessage);
                    deferred.reject(errorMessage);
                }.bind(this));
        }

        return deferred.promise;
    };

    /**
     *
     */
    BinaryValue.prototype.on = function () {
        this.logDebug("Called on()");

        return this.setPresentValue(true);
    };

    /**
     *
     */
    BinaryValue.prototype.off = function () {
        this.logDebug("Called off()");

        return this.setPresentValue(false);
    };

    /**
     *
     */
    BinaryValue.prototype.toggle = function () {
        if (this.state.presentValue) {
            return this.off();
        } else {
            return this.on();
        }
    };
};
