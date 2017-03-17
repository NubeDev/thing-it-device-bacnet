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
            },
            {
                label: "Polling Period",
                id: "pollingPeriod",
                type: {
                    id: "integer"
                },
                defaultValue: 60
            }
        ]
    },
    create: function () {
        return new BinaryValue();
    }
};

var q = require('q');

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
                    this.logDebug("ANALOG INPUT SIMULATION - publish event because of alarm");
                    this.device.publishEvent('Warning', {details: 'Something is not normal here.'});
                }
            }.bind(this), 17000));

            this.simulationIntervals.push(setInterval(function () {
                this.state.outOfService = Math.random() >= 0.5;
                this.logDebug("outOfService: " + this.state.outOfService);
                this.logDebug(this.state);
                this.publishStateChange();

                if (this.state.outOfService == true) {
                    this.logDebug("ANALOG INPUT SIMULATION - change operational state to notReachable");
                    this.operationalState = {state: 'notReachable'};
                } else {
                    this.logDebug("ANALOG INPUT SIMULATION - change operational state to normal");
                    this.operationalState = {state: 'normal'};
                }
                this.publishOperationalStateChange();
            }.bind(this), 61000));

            deferred.resolve();
        } else {
            this.logDebug("BINARY VALUE START - in normal mode");

            this.interval = setInterval(function () {
                this.update();
            }.bind(this), this.configuration.pollingPeriod * 1000);

            deferred.resolve();
        }



        return deferred.promise;
    };

    /**
     *
     */
    BinaryValue.prototype.stop = function () {
        this.logDebug("BINARY VALUE STOP");
        var deferred = q.defer();

        if (this.isSimulated()) {
            if (this.simulationIntervals) {
                for (interval in this.simulationIntervals) {
                    clearInterval(this.simulationIntervals[interval]);
                }
            }
            deferred.resolve();
        } else {
            this.logDebug("BINARY VALUE STOP - trying to unsubscribe from updates for present value");
            if (this.interval) {
                clearInterval(this.interval);
            }

            deferred.resolve();
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
            this.device.adapter.readProperty(this.configuration.objectType, this.configuration.objectId, 'present-value')
                .then(function(result) {
                    if (Array.isArray(result.propertyValue)) {
                        this.state.presentValue = result.propertyValue[0];
                    } else {
                        this.state.presentValue = result.propertyValue;
                    }
                    this.logDebug("presentValue: " + this.state.presentValue);
                    this.logDebug("State", this.state);
                    this.publishStateChange();

                    deferred.resolve();
                }.bind(this))
                .fail(function(result) {
                    this.logDebug('it did not work');
                    deferred.reject('it did not work');
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
            this.device.adapter.writeProperty(this.configuration.objectType, this.configuration.objectId, 'present-value', presentValue)
                .then(function(result) {
                    this.state.presentValue = result.propertyValue;
                    this.logDebug("presentValue: " + this.state.presentValue);
                    this.logDebug("State", this.state);
                    this.publishStateChange();

                    deferred.resolve();
                }.bind(this))
                .fail(function(result) {
                    this.logError('it did not work')
                    deferred.reject('it did not work');
                }.bind(this));
        }

        return deferred.promise;
    };

    /**
     *
     */
    BinaryValue.prototype.on = function () {
        this.logDebug("Called on()");

        return this.setPresentValue(1);
    };

    /**
     *
     */
    BinaryValue.prototype.off = function () {
        this.logDebug("Called off()");

        return this.setPresentValue(0);
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
