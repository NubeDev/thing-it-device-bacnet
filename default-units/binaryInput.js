module.exports = {
    metadata: {
        plugin: "binaryInput",
        label: "BacNet Binary Input",
        role: "actor",
        family: "binaryInput",
        deviceTypes: ["bacnet/bacNetDevice"],
        services: [{
            id: "update",
            label: "Update"
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
        return new BinaryInput();
    }
};

var q = require('q');
const OBJECT_TYPE = 'BinaryInput';

/**
 *
 */
function BinaryInput() {
    /**
     *
     */
    BinaryInput.prototype.start = function () {
        this.logDebug("BINARY INPUT START");
        var deferred = q.defer();
        this.isSubscribed = false;

        this.logDebug("BINARY INPUT START - change state");
        this.state = {
            presentValue: false,
            alarmValue: false,
            outOfService: false
        };

        this.logDebug("BINARY INPUT START - check if simulated");
        if (this.isSimulated()) {
            this.logDebug("BINARY INPUT START - in simulation");
            this.simulationIntervals = [];

            this.simulationIntervals.push(setInterval(function () {
                this.state.presentValue = Math.random() >= 0.5;
                this.logDebug("presentValue: " + this.state.presentValue);
                this.logDebug(this.state);
                this.publishStateChange();
            }.bind(this), 5000));

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
    BinaryInput.prototype.stop = function () {
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
    BinaryInput.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    BinaryInput.prototype.setState = function (state) {
        this.state = state;
    };

    /**
     *
     */
    BinaryInput.prototype.update = function () {
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

};
