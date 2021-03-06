module.exports = {
    metadata: {
        plugin: "analogValue",
        label: "BacNet Analog Value",
        role: "actor",
        family: "analogValue",
        deviceTypes: ["bacnet/bacNetDevice"],
        services: [{
            id: "update",
            label: "Update"
        }, {
            id: "setPresentValue",
            label: "Set Present Value"
        }, {
            id: "changeValue",
            label: "Change Value"
        }],

        state: [
            {
                id: "presentValue", label: "Present Value",
                type: {
                    id: "decimal"
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
            }, {
                id: "min", label: "Min",
                type: {
                    id: "float"
                }
            }, {
                id: "max", label: "Max",
                type: {
                    id: "float"
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
                label: "Minimum Value",
                id: "minValue",
                type: {
                    id: "decimal"
                },
                defaultValue: 0
            },
            {
                label: "Maximum Value",
                id: "maxValue",
                type: {
                    id: "decimal"
                },
                defaultValue: 100
            }
        ]
    },
    create: function () {
        return new AnalogValue();
    }
};

var q = require('q');
const OBJECT_TYPE = 'AnalogValue';

/**
 *
 */
function AnalogValue() {
    /**
     *
     */
    AnalogValue.prototype.start = function () {
        var deferred = q.defer();
        this.isSubscribed = false;

        this.state = {
            presentValue: 0.0,
            alarmValue: false,
            min: this.configuration.minValue,
            max: this.configuration.maxValue,
            outOfService: false,
        };

        if (!this.configuration.objectType || ("" == this.configuration.objectType)) {
            this.configuration.objectType = OBJECT_TYPE;
        }

        if (this.isSimulated()) {
            this.logDebug("Starting in simulated mode.");
            this.simulationIntervals = [];

            this.simulationIntervals.push(setInterval(function () {
                try {
                    this.setPresentValue(this.configuration.minValue +
                        (Math.random() * (this.configuration.maxValue - this.configuration.minValue)));
                } catch (e) {
                    this.logError('Error simulating value.', e);
                }
            }.bind(this), 10000));

            this.simulationIntervals.push(setInterval(function () {
                this.state.alarmValue = Math.random() >= 0.5;
                this.logDebug("alarmValue: " + this.state.alarmValue);
                this.logDebug(this.state);
                this.publishStateChange();

                if (this.state.alarmValue == true) {
                    this.logDebug("Publishing simulated alarm state.");
                    this.device.publishEvent('Warning', {details: 'Something is not normal here.'});
                }
            }.bind(this), 17000));

            this.simulationIntervals.push(setInterval(function () {
                this.state.outOfService = Math.random() >= 0.5;
                this.logDebug("outOfService: " + this.state.outOfService);
                this.logDebug(this.state);
                this.publishStateChange();

                if (this.state.outOfService == true) {
                    this.logDebug("Simulated out of service.");
                    this.operationalState = {state: 'notReachable'};
                } else {
                    this.logDebug("Simulated back in service.");
                    this.operationalState = {state: 'normal'};
                }
                this.publishOperationalStateChange();
            }.bind(this), 61000));

            deferred.resolve();
        } else {
            this.logDebug("Starting in non-simulated mode");
            this.logDebug("Subscribing to COV");
            this.device.adapter.subscribeCOV(this.configuration.objectType, this.configuration.objectId,
                this.device.bacNetDevice, function (notification) {
                    this.logDebug('received notification');

                    this.state.presentValue = notification.propertyValue;
                    this.logDebug("presentValue: " + this.state.presentValue);
                    this.logDebug("State", this.state);
                    this.publishStateChange();
                }.bind(this))
                .then(function (result) {
                    this.logDebug('Successfully subscribed to COV of presentValue on object ' + this.configuration.objectId);
                    this.isSubscribed = true;
                    deferred.resolve();
                }.bind(this))
                .fail(function (result) {
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
    AnalogValue.prototype.stop = function () {
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

            this.device.adapter.unsubscribeCOV(this.configuration.objectType, this.configuration.objectId, this.device.bacNetDevice)
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
    AnalogValue.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    AnalogValue.prototype.setState = function (state) {
        this.state = state;
    };

    /**
     *
     */
    AnalogValue.prototype.update = function () {
        var deferred = q.defer();

        this.logDebug("Called update()");

        if (this.isSimulated()) {
            this.logDebug("State", this.state);
            this.publishStateChange();

            deferred.resolve();
        } else {
            this.device.adapter.readProperty(this.configuration.objectType, this.configuration.objectId, 'presentValue', this.device.bacNetDevice)
                .then(function (result) {
                    this.state.presentValue = result.propertyValue;
                    this.logDebug("presentValue: " + this.state.presentValue);
                    this.logDebug("State", this.state);
                    this.publishStateChange();

                    deferred.resolve();
                }.bind(this))
                .fail(function (result) {
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
    AnalogValue.prototype.setPresentValue = function (presentValue) {
        var deferred = q.defer();

        this.logDebug("Called setPresentValue()");

        if (this.isSimulated()) {
            this.state.presentValue = presentValue;
            this.logDebug("presentValue: " + this.state.presentValue);
            this.logDebug("State", this.state);
            this.publishStateChange();

            deferred.resolve();
        } else {
            this.device.adapter.writeProperty(this.configuration.objectType, this.configuration.objectId, 'presentValue',
                presentValue, this.device.bacNetDevice)
                .then(function (result) {
                    if (!this.isSubscribed) {
                        this.state.presentValue = result.propertyValue;
                        this.logDebug("presentValue: " + this.state.presentValue);
                        this.logDebug("State", this.state);
                        this.publishStateChange();
                    }

                    deferred.resolve();
                }.bind(this))
                .fail(function (result) {
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
    AnalogValue.prototype.changeValue = function (parameters) {
        var promise;
        this.logDebug('Change value requested with parameters: ', parameters)

        if ((parameters) && (parameters.value)) {
            promise = this.setPresentValue(parameters.value);
        } else {
            var message = 'No value provided to change.';
            this.logDebug(message, parameters);

            promise = q.fcall(function () {
                return new Error(message);
            })
        }

        return promise;
    }
};
