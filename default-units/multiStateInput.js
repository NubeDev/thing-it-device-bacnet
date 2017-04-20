module.exports = {
    metadata: {
        plugin: "multiStateInput",
        label: "BacNet Multi State Input",
        role: "actor",
        family: "multiStateInput",
        deviceTypes: ["bacnet/bacNetDevice"],
        services: [{
            id: "update",
            label: "Update"
        }],

        state: [
            {
                id: "presentValue", label: "Present Value",
                type: {
                    id: "integer"
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
                label: "States",
                id: "states",
                type: {
                    id: "enumeration"
                },
                defaultValue: {zero: 0, one: 1}
            }
        ]
    },
    create: function () {
        return new MultiStateInput();
    }
};

var q = require('q');
const OBJECT_TYPE = 'MultiStateInput';

/**
 *
 */
function MultiStateInput() {
    /**
     *
     */
    MultiStateInput.prototype.start = function () {
        var deferred = q.defer();
        this.isSubscribed = false;

        this.state = {
            presentValue: 0,
            alarmValue: false,
            outOfService: false
        };

        if (this.isSimulated()) {
            this.logDebug("Starting in simulated mode.");
            this.simulationIntervals = [];

            this.simulationIntervals.push(setInterval(function () {
                if (Math.random() > 0.6) {
                    this.setPresentValue(Math.round(this.configuration.states.length * Math.random()));
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
            this.device.adapter.subscribeCOV('MultiStateInput', this.configuration.objectId, function(notification) {
                this.logDebug('received notification');

                this.state.presentValue = notification.propertyValue;
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
    MultiStateInput.prototype.stop = function () {
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

            this.device.adapter.unsubscribeCOV(OBJECT_TYPE, this.configuration.objectId)
                .then(function(result) {
                    this.logDebug('Successfully un-subscribed to COV of presentValue on object ' + this.configuration.objectId);
                    this.isSubscribed = false;
                    deferred.resolve();
                }.bind(this))
                .fail(function(result) {
                    var errorMessage = 'Could not un-subscribe to COV of presentValue on object '
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
    MultiStateInput.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    MultiStateInput.prototype.setState = function (state) {
        this.state = state;
    };

    /**
     *
     */
    MultiStateInput.prototype.update = function () {
        var deferred = q.defer();

        this.logDebug("Retrieving latest value...");

        if (this.isSimulated()) {
            this.logDebug("State", this.state);
            this.publishStateChange();

            deferred.resolve();
        } else {
            this.device.adapter.readProperty(OBJECT_TYPE, this.configuration.objectId, 'presentValue')
                .then(function(result) {
                    this.state.presentValue = result.propertyValue;
                    this.logDebug("presentValue: " + this.state.presentValue);
                    this.logDebug("State", this.state);
                    this.publishStateChange();

                    deferred.resolve();
                }.bind(this))
                .fail(function(result) {
                    var errorMessage = 'Could not read presentValue of object '
                        + this.configuration.objectId + ': ' + result;
                    this.logError(errorMessage);
                    deferred.reject(errorMessage);
                }.bind(this));
        }

        return deferred.promise;
    };
};
