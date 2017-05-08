module.exports = {
    metadata: {
        plugin: "light",
        label: "BACnet Light Control",
        role: "actor",
        family: "light",
        deviceTypes: ["bacnet/bacNetDevice"],
        services: [
            {id: "toggleLight", label: "Toggle Light"},
            {id: "changeDimmer", label: "Change Dimmer"},
            {id: "update", label: "Update"},
        ],
        state: [
            {
                id: "lightActive", label: "Light Active",
                type: {
                    id: "boolean"
                }
            }, {
                id: "dimmerLevel", label: "Dimmer Level",
                type: {
                    id: "decimal"
                }
            }],
        configuration: [
            {
                label: "Level Feedback Object Id",
                id: "levelFeedbackObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Level Feedback Object Type",
                id: "levelFeedbackObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Level Modification Object Id",
                id: "levelModificationObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Level Modification Object Type",
                id: "levelModificationObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Light Active Feedback Object Id",
                id: "lightActiveFeedbackObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Light Active Feedback Object Type",
                id: "lightActiveFeedbackObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Light Active Modification Object Id",
                id: "lightActiveModificationObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Light Active Modification Object Type",
                id: "lightActiveModificationObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Light Active Modification Value On",
                id: "lightActiveModificationValueOn",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Light Active Modification Value Off",
                id: "lightActiveModificationValueOff",
                type: {
                    id: "integer"
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
                lightActive: false,
                dimmerLevel: 75
            };

        } else {
            this.state = {};
            this.logDebug("Starting in non-simulated mode");
            this.logDebug("Subscribing to COVs");

            promise = this.device.adapter.readProperty(this.configuration.lightActiveFeedbackObjectType,
                this.configuration.lightActiveFeedbackObjectId, 'stateText', this.device.bacNetDevice)
                .then(function (result) {
                    this.logDebug('Viable modes: ' + result);
                    this.modeStrings = result.propertyValue;
                }.bind(this))
                .then(function () {
                    return q.all([
                        this.device.adapter.subscribeCOV(this.configuration.levelFeedbackObjectType, this.configuration.levelFeedbackObjectId,
                            this.device.bacNetDevice, function (notification) {
                                this.logDebug('Received dimmer level feedback notification.');
                                this.state.dimmerLevel = notification.propertyValue;
                                this.logDebug("Dimmer Level: " + this.state.dimmerLevel);
                                this.logDebug("State", this.state);
                                this.publishStateChange();
                            }.bind(this)),
                        this.device.adapter.subscribeCOV(this.configuration.lightActiveFeedbackObjectType, this.configuration.lightActiveFeedbackObjectId,
                            this.device.bacNetDevice, function (notification) {
                                this.logDebug('Received light active notification.');
                                this.logDebug("Mode ID: " + notification.propertyValue);
                                this.state.mode = this.modeStrings[notification.propertyValue - 1];
                                this.logDebug("Mode: " + this.state.mode);

                                switch (this.state.mode) {
                                    case 'ON':
                                        this.state.lightActive = true;
                                        break;
                                    case 'OFF':
                                        this.state.lightActive = false;
                                        break;
                                    default:
                                        this.state.lightActive = false;
                                        break;
                                }

                                this.logDebug("State", this.state);
                                this.publishStateChange();
                            }.bind(this))])
                        .then(function (result) {
                            this.logDebug('Successfully subscribed to COVs.');
                            this.isSubscribed = true;
                        }.bind(this))
                        .fail(function (result) {
                            var errorMessage = 'Could not subscribe to COV of object ' +
                                this.configuration.levelFeedbackObjectId + ': ' + result;
                            this.logError(errorMessage);
                            throw new Error(errorMessage);
                        }.bind(this));
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
                this.device.adapter.unsubscribeCOV(this.configuration.levelFeedbackObjectType, this.configuration.levelFeedbackObjectId,
                    this.device.bacNetDevice, function (notification) {
                    }.bind(this)),
                this.device.adapter.unsubscribeCOV(this.configuration.lightActiveFeedbackObjectType, this.configuration.lightActiveFeedbackObjectId,
                    this.device.bacNetDevice, function (notification) {
                    }.bind(this))])
                .then(function (result) {
                    this.logDebug('Successfully subscribed to COVs.');
                    this.isSubscribed = true;
                }.bind(this))
                .fail(function (result) {
                    var errorMessage = 'Could not un-subscribe from all COV objects: '
                        + this.configuration.levelFeedbackObjectId + ': ' + result;
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

        if (this.isSimulated()) {
            this.state = targetstate;
            this.publishStateChange();
        } else {
            if (targetstate) {
                this.logDebug('In the target state modification...');
                promise = q.all([
                    this.setDimmerLevelModification(targetstate.dimmerLevel),
                    q.fcall(function () {
                        var innerPromise;
                        this.logDebug('Adjusting light (from, to): ', this.state.lightActive, targetstate.lightActive);

                        if (this.state.lightActive !== targetstate.lightActive) {
                            innerPromise = this.toggleLight();
                        } else {
                            innerPromise = q();
                        }

                        return innerPromise;
                    }.bind(this))])
                    .fail(function (error) {
                        this.logDebug(error);
                    }.bind(this));
            }
            else {
                promise = q.fcall(function () {
                    throw new Error('Provided state was empty.');
                });
            }

            return promise;
        }
    }
    ;

    /**
     *
     */
    Light.prototype.setDimmerLevelModification = function (targetModification) {
        var promise;
        this.logDebug('Setting dimmer level modification.', targetModification);

        promise = this.device.adapter.writeProperty(this.configuration.levelModificationObjectType,
            this.configuration.levelModificationObjectId, 'presentValue', targetModification, this.device.bacNetDevice)
            .delay(500).then(function () {
                this.logDebug('Wrote level modification value: ', targetModification);
                return this.update();
            }.bind(this));

        return promise;
    };

    /**
     *
     */
    Light.prototype.setLightActiveModification = function (targetModification) {
        var promise;
        this.logDebug('Setting light active modification.', targetModification);

        promise = this.device.adapter.writeProperty(this.configuration.lightActiveModificationObjectType,
            this.configuration.lightActiveModificationObjectId, 'presentValue', targetModification, this.device.bacNetDevice)
            .delay(500).then(function () {
                this.logDebug('Wrote light active modification value: ', targetModification);
                return this.update();
            }.bind(this));

        return promise;
    };

    /**
     *
     */
    Light.prototype.update = function () {
        var promise;

        this.logDebug('Updating values...');

        if (this.isSimulated()) {
            promise = q();
            this.state.dimmerLevel = Math.round(Math.random() * 100);
            this.state.lightActive = Math.random() > 0.3;
            this.publishStateChange();
        } else {
            promise = q.all([
                this.device.adapter.readProperty(this.configuration.levelFeedbackObjectType,
                    this.configuration.levelFeedbackObjectId, 'presentValue', this.device.bacNetDevice)
                    .then(function (result) {
                        this.logDebug('Updating level.');
                        this.state.dimmerLevel = result.propertyValue;
                        this.publishStateChange();
                    }.bind(this)),
                this.device.adapter.readProperty(this.configuration.lightActiveFeedbackObjectType,
                    this.configuration.lightActiveFeedbackObjectId, 'presentValue', this.device.bacNetDevice)
                    .then(function (result) {
                        this.logDebug('Received light active notification.');
                        this.logDebug("Mode ID: " + result.propertyValue);
                        this.state.mode = this.modeStrings[result.propertyValue - 1];
                        this.logDebug("Mode: " + this.state.mode);

                        switch (this.state.mode) {
                            case 'ON':
                                this.state.lightActive = true;
                                break;
                            case 'OFF':
                                this.state.lightActive = false;
                                break;
                            default:
                                this.state.lightActive = false;
                                break;
                        }

                        this.logDebug("State", this.state);
                        this.publishStateChange();
                    }.bind(this))
            ]).then(function () {
                this.logDebug('All updates received.');
                this.logDebug(this.state);
            }.bind(this));
        }

        return promise;
    };


    /**
     *
     */
    Light.prototype.toggleLight = function () {
        var promise;

        if (this.isSimulated()) {
            this.state.lightActive = !this.state.lightActive;
            promise = q();
        } else {
            var lightModification;

            if (this.state.lightActive) {
                lightModification = this.configuration.lightActiveModificationValueOff;
            } else {
                lightModification = this.configuration.lightActiveModificationValueOn;
            }

            promise = this.setLightActiveModification(lightModification);
        }

        return promise;
    };

    /**
     *
     */
    Light.prototype.changeDimmer = function (parameters) {
        var promise;
        this.logDebug('Change value requested with parameters: ', parameters)

        if ((parameters) && (parameters.value)) {

            if (this.isSimulated()) {
                this.state.dimmerLevel = parameters.value;
                promise = q();
            } else {
                promise = this.setDimmerLevelModification(parameters.value);
            }

        } else {
            var message = 'No value provided to change.';
            this.logDebug(message, parameters);

            promise = q.fcall(function () {
                return new Error(message);
            })
        }

        return promise;
    };
}
;
