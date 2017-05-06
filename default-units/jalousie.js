module.exports = {
    metadata: {
        plugin: "jalousie",
        label: "BACnet Jalousie Control",
        role: "actor",
        family: "jalousie",
        deviceTypes: ["bacnet/bacNetDevice"],
        services: [
            {id: "incrementPosition", label: "Increment Position"},
            {id: "decrementPosition", label: "Decrement Position"},
            {id: "positionUp", label: "Position Up"},
            {id: "positionDown", label: "Position Down"},
            {id: "decrementRotation", label: "Increment Rotation"},
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
            },
            {
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
        return new Light();
    }
};

var q = require('q');

/**
 *
 */
function Light() {
    /**
     *
     */
    Light.prototype.start = function () {
        var promise;


        if (this.isSimulated()) {
            promise = q();

            this.state = {
                rotation: 110,
                position: 30
            };

        } else {
            this.state = {};
            this.logDebug("Starting in non-simulated mode");
            this.logDebug("Subscribing to COVs for position and rotation");

            promise = q.all([
                this.device.adapter.subscribeCOV(this.configuration.positionFeedbackObjectType,
                    this.configuration.positionFeedbackObjectId, this.device.bacNetDevice, function (notification) {
                        this.logDebug('Received position feedback notification.');
                        this.state.position = notification.propertyValue;
                        this.logDebug("Position: " + this.state.position);
                        this.logDebug("State", this.state);
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
                    var errorMessage = 'Could not subscribe to COVs of object '
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
    Light.prototype.stop = function () {
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
    Light.prototype.getState = function () {
        return this.state;
    };

    /**
     *
     */
    Light.prototype.setState = function (targetstate) {
        var promise;
        this.logDebug('Received set state.', targetstate);

//        if (this.isSimulated()) {
        //TODO remove
        if (true) {
            this.state = targetstate;
            this.publishStateChange();
        } else {
        }
    };

    /**
     *
     */
    Light.prototype.update = function () {
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
    Light.prototype.raisePosition = function () {
        var promise;

        if (this.isSimulated()) {
            promise = q();
            this.state.position = (this.state.position < 10 ? 0 : this.state.position - 10);
            this.publishStateChange();
        } else {
            promise = this.setPositionModification(-10);
        }

        return promise;
    };

    /**
     *
     */
    Light.prototype.lowerPosition = function () {
        var promise;

        promise = q();
        this.state.position = (this.state.position > 90 ? 100 : this.state.position + 10);
        this.publishStateChange();
        return promise;
    };

    /**
     *
     */
    Light.prototype.positionUp = function () {
        var promise;

        promise = q();
        this.state.position = 0;
        this.publishStateChange();
        return promise;
    };

    /**
     *
     */
    Light.prototype.positionDown = function () {
        var promise;

        promise = q();
        this.state.position = 100;
        this.publishStateChange();
        return promise;
    };

    /**
     *
     */
    Light.prototype.incrementRotation = function () {
        var promise;

        promise = q();
        this.state.rotation = (this.state.rotation > 160 ? 170 : this.state.rotation + 10);
        this.publishStateChange();
        return promise;
    };

    /**
     *
     */
    Light.prototype.decrementRotation = function () {
        var promise;

        promise = q();
        this.state.rotation = (this.state.rotation < 100 ? 90 : this.state.rotation - 10);
        this.publishStateChange();
        return promise;
    };

};