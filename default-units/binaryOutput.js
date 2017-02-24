module.exports = {
    metadata: {
        plugin: "binaryInput",
        label: "BacNet Binary Input",
        role: "actor",
        family: "binaryInput",
        deviceTypes: ["bacNet/bacNet"],
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
                    id: "integer"
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
            }]
    },
    create: function () {
        return new BinaryInput();
    }
};

var q = require('q');

/**
 *
 */
function BinaryInput() {
    /**
     *
     */
    BinaryInput.prototype.start = function () {
        var deferred = q.defer();

        this.state = {
            presentValue: false,
            alarmValue: 0,
            outOfService: false
        };

        if (this.isSimulated()) {

        } else {
            //this.device.nodes[this.configuration.nodeId] = {unit: this};
            //TODO: what are the correct names here?
            this.device.objects[this.configuration.objectId] = {unit: this};
        }

        deferred.resolve();

        return deferred.promise;
    };

    /**
     *
     */
    BinaryInput.prototype.setStateFromBacNet = function (value) {
        this.state.presentValue = value.value;
        this.logDebug("State", this.state);
        this.publishStateChange();
    };

    /**
     *
     */
    BinaryInput.prototype.stop = function () {
        var deferred = q.defer();

        deferred.resolve();

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
        if (state.presentValue) {
            this.on();
        } else {
            this.off();
        }
    };

    /**
     *
     */
    BinaryInput.prototype.on = function () {
        this.logDebug("Called on()");

        if (this.isSimulated()) {

        } else {

        }

        this.state.presentValue = true;
        this.logDebug("State", this.state);
        this.publishStateChange();
    };

    /**
     *
     */
    BinaryInput.prototype.off = function () {
        this.logDebug("Called off()");

        if (this.isSimulated()) {

        } else {

        }

        this.state.presentValue = false;
        this.logDebug("State", this.state);
        this.publishStateChange();
    };

    /**
     *
     */
    BinaryInput.prototype.toggle = function () {
        if (this.state.presentValue) {
            this.off();
        } else {
            this.on();
        }
    };
};
