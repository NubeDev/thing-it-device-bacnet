module.exports = {
    metadata: {
        plugin: "thermostat",
        label: "BACnet Thermostat",
        role: "actor",
        family: "thermostat",
        deviceTypes: ["bacnet/bacNetDevice"],
        services: [
            {id: "incrementSetpoint", label: "Increment Setpoint"},
            {id: "decrementSetpoint", label: "Decrement Setpoint"},
        ],
        state: [
            {
                id: "setpoint", label: "Setpoint",
                type: {
                    id: "decimal"
                }
            }, {
                id: "temperature", label: "Temperature",
                type: {
                    id: "decimal"
                }
            }, {
                id: "heatActive", label: "Heat Active",
                type: {
                    id: "boolean"
                }
            }, {
                id: "coolActive", label: "Cool Active",
                type: {
                    id: "boolean"
                }
            }],
        configuration: [
            {
                label: "Setpoint Feedback Object Id",
                id: "setpointFeedbackObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Setpoint Feedback Object Type",
                id: "setpointFeedbackObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Temperature Object Id",
                id: "temperatureObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Temperature Object Type",
                id: "temperatureObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Setpoint Modification Object Id",
                id: "setpointModificationObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Setpoint Modification Object Type",
                id: "setpointModificationObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }
        ]
    },
    create: function () {
        return new Thermostat();
    }
};

var q = require('q');

/**
 *
 */
function Thermostat() {
    /**
     *
     */
    Thermostat.prototype.start = function () {
        var promise;
        var deferred = q.defer();

        if (this.isSimulated()) {
            this.state = {
                temperature: 21,
                setpoint: 21,
                mode: "HEAT",
                operatingState: "OFF",
                heatActive: false,
                coolActive: false
            };

            this.simulationInterval = setInterval(function () {
                if (this.state.mode == "HEAT") {
                    if (this.state.operatingState == "OFF") {
                        this.state.temperature -= 0.5;

                        if (this.state.temperature < (this.state.setpoint - 1)) {
                            this.state.operatingState = "ON";
                            this.state.heatActive = true;
                        }
                    } else {
                        this.state.temperature += 0.5;

                        if (this.state.temperature > (this.state.setpoint + 1)) {
                            this.state.operatingState = "OFF";
                            this.state.heatActive = false;
                        }
                    }
                } else {
                    if (this.state.operatingState == "ON") {
                        this.state.temperature -= 0.5;

                        if (this.state.temperature < (this.state.setpoint - 1)) {
                            this.state.operatingState = "OFF";
                            this.state.coolActive = false;
                        }
                    } else {
                        this.state.temperature += 0.5;

                        if (this.state.temperature > (this.state.setpoint + 1)) {
                            this.state.operatingState = "ON";
                            this.state.coolActive = true;
                        }
                    }
                }

                deferred.resolve();
                promise = deferred.promise;
                this.publishStateChange();
            }.bind(this), 10000);
        } else {
            this.state = {
                //TODO implement proper data retrieval for the mode and whether it's active
                heatActive: false,
                coolActive: false
            };
            this.logDebug("Starting in non-simulated mode");
            this.logDebug("Subscribing to Setpoint COV");

            promise = q.all([
                this.device.adapter.subscribeCOV(this.configuration.setpointFeedbackObjectType, this.configuration.setpointFeedbackObjectId,
                    this.device.bacNetDevice, function (notification) {
                        this.logDebug('Received setpoint feedback notification.');
                        this.state.setpoint = notification.propertyValue;
                        this.logDebug("Setpoint: " + this.state.setpoint);
                        this.logDebug("State", this.state);
                        this.publishStateChange();
                    }.bind(this)),
                this.device.adapter.subscribeCOV(this.configuration.temperatureObjectType, this.configuration.temperatureObjectId,
                    this.device.bacNetDevice, function (notification) {
                        this.logDebug('Received temperature notification.');
                        this.state.temperature = notification.propertyValue;
                        this.logDebug("Temperature: " + this.state.temperature);
                        this.logDebug("State", this.state);
                        this.publishStateChange();
                    }.bind(this))])
                .then(function (result) {
                    this.logDebug('Successfully subscribed to COVs.');
                    this.isSubscribed = true;
                }.bind(this))
                .fail(function (result) {
                    var errorMessage = 'Could not subscribe to setpoint COV of object '
                        + this.configuration.setpointFeedbackObjectId + ': ' + result;
                    this.logError(errorMessage);
                    throw new Error(errorMessage);
                }.bind(this));
        }


        return promise;
    };

    /**
     *
     */
    Thermostat.prototype.stop = function () {
        var promise;

        if (this.isSimulated()) {
            if (this.simulationInterval) {
                clearInterval(this.simulationInterval);
            }

            promise = q();
        } else {
            this.logDebug("Attempting to un-subscribe from updates.");

            promise = q.all([
                this.device.adapter.unsubscribeCOV(this.configuration.setpointFeedbackObjectType, this.configuration.setpointFeedbackObjectId,
                    this.device.bacNetDevice, function (notification) {
                    }.bind(this)),
                this.device.adapter.unsubscribeCOV(this.configuration.temperatureObjectType, this.configuration.temperatureObjectId,
                    this.device.bacNetDevice, function (notification) {
                    }.bind(this))])
                .then(function (result) {
                    this.logDebug('Successfully subscribed to COVs.');
                    this.isSubscribed = true;
                }.bind(this))
                .fail(function (result) {
                    var errorMessage = 'Could not un-subscribe from all COV objects: '
                        + this.configuration.setpointFeedbackObjectId + ': ' + result;
                    this.logError(errorMessage);
                    throw new Error(errorMessage);
                }.bind(this));
        }

        return promise;
    };

    /**
     *
     */
    Thermostat.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    Thermostat.prototype.setState = function (targetstate) {
        var promise;
        this.logDebug('Received set state.', targetstate);

        if (targetstate) {
            promise = this.update().then(function () {
                var promise = q();
                var steps = targetstate.setpoint - this.state.setpoint;
                this.logDebug('Adjusting temperature (from, to, steps): ', this.state.setpoint, targetstate.setpoint, steps);
                var funcs = [];

                if (steps > 0) {
                    for (var i = 0; i < steps; i++) {
                        this.logDebug('Adding increment');
                        funcs[i] = this.incrementSetpoint.bind(this);
                    }
                } else if (steps < 0) {
                    for (var i = 0; i < steps; i++) {
                        this.logDebug('Adding decrement');
                        funcs[i] = this.decrementSetpoint.bind(this);
                    }
                }

                funcs.forEach(function (f) {
                    promise = promise.then(f).delay(500);
                });

                return promise;
            }.bind(this));
        } else {
            promise = q.fcall(function () {
                throw new Error('Provided state was empty.')
            })
        }

        return promise;
    };

    /**
     *
     */
    Thermostat.prototype.setSetpointModification = function (targetModification) {
        var promise;
        this.logDebug('Setting setpoint modification.', targetModification);

        promise = this.device.adapter.writeProperty(this.configuration.setpointModificationObjectType,
            this.configuration.setpointModificationObjectId, 'presentValue', targetModification, this.device.bacNetDevice)
            .delay(500).then(function () {
                this.logDebug('Wrote setpoint modification value: ', targetModification);
                return this.update();
            }.bind(this));

        return promise;
    };

    /**
     *
     */
    Thermostat.prototype.update = function () {
        this.logDebug('Updating values...');
        return q.all([
            this.device.adapter.readProperty(this.configuration.setpointFeedbackObjectType,
                this.configuration.setpointFeedbackObjectId, 'presentValue', this.device.bacNetDevice)
                .then(function (result) {
                    this.logDebug('Updating setpoint.');
                    this.state.setpoint = result.propertyValue;
                }.bind(this)),
            this.device.adapter.readProperty(this.configuration.temperatureObjectType,
                this.configuration.temperatureObjectId, 'presentValue', this.device.bacNetDevice)
                .then(function (result) {
                    this.state.temperature = result.propertyValue;
                }.bind(this))
        ]).then(function () {
            this.logDebug('All updates received.');
            this.logDebug(this.state);
            this.publishStateChange();
        }.bind(this));
    };


    /**
     *
     */
    Thermostat.prototype.incrementSetpoint = function () {
        return this.setSetpointModification(1);
    };

    /**
     *
     */
    Thermostat.prototype.decrementSetpoint = function () {
        return this.setSetpointModification(-1);
    };
};
