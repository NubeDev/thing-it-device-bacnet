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
                label: "Position Step Size",
                id: "positionStepSize",
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
            }, {
                label: "Rotation Up Value",
                id: "rotationUpValue",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Rotation Down Value",
                id: "rotationDownValue",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Rotation Step Size",
                id: "rotationStepSize",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Action Object Id",
                id: "actionObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Action Object Type",
                id: "actionObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Action Go Value",
                id: "actionGoValue",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Action Stop Value",
                id: "actionStopValue",
                type: {
                    id: "integer"
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
                        }

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
            promise = this.setModification(targetstate.position, targetstate.rotation);
        }

        return promise;
    };


    /**
     *
     */
    Jalousie.prototype.setModification = function (position, rotation) {
        this.logDebug('Modifying position and rotation', position, rotation);
        return q.all([
            this.device.adapter.writeProperty(this.configuration.positionModificationObjectType,
                this.configuration.positionModificationObjectId, 'presentValue', position, this.device.bacNetDevice)
                .then(function (result) {
                    this.logDebug('Modified Position', position, result);
                }.bind(this)),
            this.device.adapter.writeProperty(this.configuration.rotationModificationObjectType,
                this.configuration.rotationModificationObjectId, 'presentValue', rotation, this.device.bacNetDevice)
                .then(function (result) {
                    this.logDebug('Modified Rotation', rotation, result);
                }.bind(this))])
            .then(function () {
                return this.device.adapter.writeProperty(this.configuration.actionObjectType,
                    this.configuration.actionObjectId, 'presentValue', this.configuration.actionGoValue, this.device.bacNetDevice)
                    .then(function (result) {
                        this.logDebug('Modified Action', this.configuration.actionGoValue, result);
                    }.bind(this));
            }.bind(this));
    };


    /**
     *
     */
    Jalousie.prototype.raisePosition = function () {
        var promise;

        if (this.isSimulated()) {
            promise = q();
            this.state.position = (this.state.position < this.configuration.positionStepSize ?
                0 : this.state.position - this.configuration.positionStepSize);
            this.publishStateChange();
        } else {
            var targetPosition = this.state.position - this.configuration.positionStepSize;
            this.logDebug("Target Position", targetPosition);
            promise = this.setModification(targetPosition, this.configuration.rotationUpValue);
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
            this.state.position = (this.state.position > (100 - this.configuration.positionStepSize) ?
                100 : this.state.position + this.configuration.positionStepSize);
            this.publishStateChange();
        } else {
            var targetPosition = this.state.position + this.configuration.positionStepSize;
            this.logDebug("Target Position", targetPosition);
            promise = this.setModification(targetPosition, this.configuration.rotationDownValue);
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
            promise = this.setModification(0, this.configuration.rotationUpValue);
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
            promise = this.setModification(100, this.configuration.rotationDownValue);
        }

        return promise;
    };

    /**
     *
     */
    Jalousie.prototype.incrementRotation = function () {
        var promise;

        if (this.isSimulated()) {
            promise = q();
            this.state.rotation = (this.state.rotation > 160 ? 170 : this.state.rotation + 10);
            this.publishStateChange();
        } else {
            var targetRotation = this.state.rotation + this.configuration.rotationStepSize;
            this.logDebug("Target Rotation", targetRotation);
            promise = this.setModification(this.state.position, targetRotation);
        }

        return promise;
    };

    /**
     *
     */
    Jalousie.prototype.decrementRotation = function () {
        var promise;

        if (this.isSimulated()) {
            promise = q();
            this.state.rotation = (this.state.rotation < 100 ? 90 : this.state.rotation - 10);
            this.publishStateChange();
        } else {
            var targetRotation = this.state.rotation - this.configuration.rotationStepSize;
            this.logDebug("Target Rotation", targetRotation);
            promise = this.setModification(this.state.position, targetRotation);
        }

        return promise;
    };

}
