module.exports = {
    metadata: {
        plugin: "jalousie",
        label: "BACnet Jalousie Control",
        role: "actor",
        family: "jalousie",
        deviceTypes: ["bacnet/bacNetDevice"],
        services: [
            {id: "lowerPosition", label: "Lower Position"},
            {id: "raisePosition", label: "Raise Position"},
            {id: "positionUp", label: "Position Up"},
            {id: "positionDown", label: "Position Down"},
            {id: "decrementRotation", label: "Decrement Rotation"},
            {id: "incrementRotation", label: "Increment Rotation"},
        ],
        state: [
            {
                id: "position", label: "position",
                type: {
                    id: "decimal"
                }
            }, {
                id: "rotation", label: "rotation",
                type: {
                    id: "decimal"
                }
            }],
        configuration: [
            {
                label: "Position Feedback Object Id",
                id: "positionFeedbackObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Position Feedback Object Type",
                id: "positionFeedbackObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Position Modification Object Id",
                id: "positionModificationObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Position Modification Object Type",
                id: "positionModificationObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Position Modification Increment Value",
                id: "positionModificationIncrementValue",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Position Modification Decrement Value",
                id: "positionModificationDecrementValue",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Position Modification Stop Value",
                id: "positionModificationStopValue",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Position Modification Stop Time",
                id: "positionModificationStopTime",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Rotation Feedback Object Id",
                id: "rotationFeedbackObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Rotation Feedback Object Type",
                id: "rotationFeedbackObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Rotation Modification Object Id",
                id: "rotationModificationObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Rotation Modification Object Type",
                id: "rotationModificationObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }
        ]
    },
    create: function () {
        return new Jalousie();
    }
};

var q = require('q');

/**
 *
 */
function Jalousie() {
    /**
     *
     */
    Jalousie.prototype.start = function () {
        var promise;


        if (this.isSimulated()) {
            promise = q();

            this.state = {
                rotation: 110,
                position: 30
            };

        } else {
            this.state = {};
            this.internalListeners = [];
            this.logDebug("Starting in non-simulated mode");
            this.logDebug("Subscribing to COVs for position and rotation");

            promise = q.all([
                this.device.adapter.subscribeCOV(this.configuration.positionFeedbackObjectType,
                    this.configuration.positionFeedbackObjectId, this.device.bacNetDevice, function (notification) {
                        this.logDebug('Received position feedback notification.');
                        this.state.position = notification.propertyValue;
                        this.logDebug("Position: " + this.state.position);
                        this.logDebug("State", this.state);

                        function notifyListeners(element, index, array) {
                            element(index);
                        };

                        this.internalListeners.forEach(notifyListeners);

                        this.publishStateChange();
                    }.bind(this)),
                this.device.adapter.subscribeCOV(this.configuration.rotationFeedbackObjectType,
                    this.configuration.rotationFeedbackObjectId, this.device.bacNetDevice, function (notification) {
                        this.logDebug('Received rotation notification.');
                        this.state.rotation = notification.propertyValue;
                        this.logDebug("Rotation: " + this.state.rotation);
                        this.logDebug("State", this.state);
                        this.publishStateChange();
                    }.bind(this))])
                .then(function (result) {
                    this.logDebug('Successfully subscribed to COVs.');
                    this.isSubscribed = true;
                }.bind(this))
                .fail(function (result) {
                    var errorMessage = 'Could not subscribe to COVs of object ' +
                        this.configuration.setpointFeedbackObjectId + ': ' + result;
                    this.logError(errorMessage);
                    throw new Error(errorMessage);
                }.bind(this));
        }


        return promise;
    };

    /**
     *
     */
    Jalousie.prototype.stop = function () {
        var promise;

        if (this.isSimulated()) {
            if (this.simulationInterval) {
                clearInterval(this.simulationInterval);
            }

            promise = q();
        } else {
            this.logDebug("Attempting to un-subscribe from updates.");

            promise = q.all([
                this.device.adapter.unsubscribeCOV(this.configuration.positionFeedbackObjectType, this.configuration.positionFeedbackObjectId,
                    this.device.bacNetDevice, function (notification) {
                    }.bind(this)),
                this.device.adapter.unsubscribeCOV(this.configuration.rotationFeedbackObjectType, this.configuration.rotationFeedbackObjectId,
                    this.device.bacNetDevice, function (notification) {
                    }.bind(this))])
                .then(function (result) {
                    this.logDebug('Successfully un-subscribed from COVs.');
                    this.isSubscribed = true;
                }.bind(this))
                .fail(function (result) {
                    var errorMessage = 'Could not un-subscribe from all COV objects: ' +
                        this.configuration.setpointFeedbackObjectId + ': ' + result;
                    this.logError(errorMessage);
                    throw new Error(errorMessage);
                }.bind(this));
        }

        return promise;
    };

    /**
     *
     */
    Jalousie.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    Jalousie.prototype.setState = function (targetstate) {
        var promise;
        this.logDebug('Received set state.', targetstate);

        if (this.isSimulated()) {
            promise = q();
            this.state = targetstate;
            this.publishStateChange();
        } else {
            var deferred = q.defer();

            if (this.state.position > targetstate.position) {
                this.internalListeners.push(function (element) {
                    if (this.state.position < targetstate.position) {
                        this.setPositionModification(this.configuration.positionModificationStopValue);
                        this.internalListeners.splice(element,1);
                        deferred.resolve();
                    }
                }.bind(this));

                this.setPositionModification(this.configuration.positionModificationDecrementValue).then(function () {
                    setTimeout(function () {
                        this.logError(this.state);
                        deferred.reject('Desired target position ' + targetstate.position + ' not reached after 20s.');
                    }.bind(this), 20000);
                });
            } else {
                this.internalListeners.push(function (element) {
                    if (this.state.position > targetstate.position) {
                        this.setPositionModification(this.configuration.positionModificationStopValue);
                        this.internalListeners.splice(element,1);
                        deferred.resolve();
                    }
                }.bind(this));

                this.setPositionModification(this.configuration.positionModificationIncrementValue).then(function () {
                    setTimeout(function () {
                        this.logError(this.state);
                        deferred.reject('Desired target position ' + targetstate.position + ' not reached after 20s.');
                    }.bind(this), 20000);
                });
            }

            promise = deferred.promise;
        }

        return promise;
    };

    /**
     *
     */
    Jalousie.prototype.update = function () {
        var promise;

        this.logDebug('Updating values...');

        //        if (this.isSimulated()) {
        //TODO remove
        if (true) {
            promise = q();
            this.state.position = Math.round(Math.random() * 100);
            this.state.rotation = 90 + Math.round(Math.random() * 80);
            this.publishStateChange();
        } else {
        }

        return promise;
    };


    /**
     *
     */
    Jalousie.prototype.setPositionModification = function (modificationValue) {
        this.logDebug('Modifying position', modificationValue);
        return this.device.adapter.writeProperty(this.configuration.positionModificationObjectType,
            this.configuration.positionModificationObjectId, 'presentValue', modificationValue, this.device.bacNetDevice)
            .then(function (result) {
                this.logDebug('Modified Position', modificationValue, result);
            }.bind(this));
    };


    /**
     *
     */
    Jalousie.prototype.raisePosition = function () {
        var promise;

        if (this.isSimulated()) {
            promise = q();
            this.state.position = (this.state.position < 10 ? 0 : this.state.position - 10);
            this.publishStateChange();
        } else {
            promise = this.setPositionModification(this.configuration.positionModificationDecrementValue)
                .delay(this.configuration.positionModificationStopTime)
                .then(function (lastState) {
                    return this.setPositionModification(this.configuration.positionModificationStopValue);
                }.bind(this));
        }

        return promise;
    };

    /**
     *
     */
    Jalousie.prototype.lowerPosition = function () {
        var promise;

        if (this.isSimulated()) {
            promise = q();
            this.state.position = (this.state.position > 90 ? 100 : this.state.position + 10);
            this.publishStateChange();
        } else {
            promise = this.setPositionModification(this.configuration.positionModificationIncrementValue)
                .delay(this.configuration.positionModificationStopTime)
                .then(function (lastState) {
                    return this.setPositionModification(this.configuration.positionModificationStopValue);
                }.bind(this));
        }

        return promise;
    };

    /**
     *
     */
    Jalousie.prototype.positionUp = function () {
        var promise;

        if (this.isSimulated()) {
            promise = q();
            this.state.position = 0;
            this.publishStateChange();
        } else {
            promise = this.setPositionModification(this.configuration.positionModificationDecrementValue);
        }

        return promise;
    };

    /**
     *
     */
    Jalousie.prototype.positionDown = function () {
        var promise;

        if (this.isSimulated()) {
            promise = q();
            this.state.position = 100;
            this.publishStateChange();
        } else {
            promise = this.setPositionModification(this.configuration.positionModificationIncrementValue);
        }

        return promise;
    };

    /**
     *
     */
    Jalousie.prototype.incrementRotation = function () {
        var promise;

        promise = q();
        this.state.rotation = (this.state.rotation > 160 ? 170 : this.state.rotation + 10);
        this.publishStateChange();
        return promise;
    };

    /**
     *
     */
    Jalousie.prototype.decrementRotation = function () {
        var promise;

        promise = q();
        this.state.rotation = (this.state.rotation < 100 ? 90 : this.state.rotation - 10);
        this.publishStateChange();
        return promise;
    };

};
