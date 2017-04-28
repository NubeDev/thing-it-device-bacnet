module.exports = {
    metadata: {
        plugin: "jalousie",
        label: "BACnet Jalousie Control",
        role: "actor",
        family: "jalousie",
        deviceTypes: ["bacnet/bacNetDevice"],
        services: [
            {id: "incrementJalousiePosition", label: "Increment Jalousie Position"},
            {id: "decrementJalousiePosition", label: "Decrement Jalousie Position"},
            {id: "jalousiePositionUp", label: "Jalousie Position Up"},
            {id: "jalousiePositionDown", label: "Jalousie Position Down"},
            {id: "decrementJalousieRotation", label: "Decrement Jalousie Rotation"},
            {id: "decrementJalousieRotation", label: "Decrement Jalousie Rotation"},
        ],
        state: [
            {
                id: "jalousiePosition", label: "Jalousie Position",
                type: {
                    id: "decimal"
                }
            }, {
                id: "jalousieRotation", label: "Jalousie Rotation",
                type: {
                    id: "decimal"
                }
            }],
        configuration: [
            {
                label: "Jalousie Position Feedback Object Id",
                id: "jalousiePositionFeedbackObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Jalousie Position Feedback Object Type",
                id: "jalousiePositionFeedbackObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Jalousie Position Modification Object Id",
                id: "jalousiePositionModificationObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Jalousie Position Modification Object Type",
                id: "jalousiePositionModificationObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            },
            {
                label: "Jalousie Rotation Feedback Object Id",
                id: "jalousieRotationFeedbackObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Jalousie Rotation Feedback Object Type",
                id: "jalousieRotationFeedbackObjectType",
                type: {
                    id: "string"
                },
                defaultValue: ""
            }, {
                label: "Jalousie Rotation Modification Object Id",
                id: "jalousieRotationModificationObjectId",
                type: {
                    id: "integer"
                },
                defaultValue: ""
            }, {
                label: "Jalousie Rotation Modification Object Type",
                id: "jalousieRotationModificationObjectType",
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


//        if (this.isSimulated()) {
        //TODO remove
        if (true) {
            promise = q();

            this.state = {
                jalousieRotation: 110,
                jalousiePosition: 30
            };

        } else {
        }


        return promise;
    };

    /**
     *
     */
    Light.prototype.stop = function () {
        var promise;

//        if (this.isSimulated()) {
        //TODO remove
        if (true) {
            if (this.simulationInterval) {
                clearInterval(this.simulationInterval);
            }

            promise = q();
        } else {
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
            this.state.jalousiePosition = Math.round(Math.random() * 100);
            this.state.jalousieRotation = 90 + Math.round(Math.random() * 80);
            this.publishStateChange();
        } else {
        }

        return promise;
    };


    /**
     *
     */
    Light.prototype.raiseJalousiePosition = function (){
        var promise;

        promise = q();
        this.state.jalousiePosition = (this.state.jalousiePosition < 10 ? 0 : this.state.jalousiePosition - 10);
        this.publishStateChange();
        return q();
    };

    /**
     *
     */
    Light.prototype.lowerJalousiePosition = function (){
        var promise;

        promise = q();
        this.state.jalousiePosition = (this.state.jalousiePosition > 90 ? 100 : this.state.jalousiePosition + 10);
        this.publishStateChange();
        return promise;
    };

    /**
     *
     */
    Light.prototype.jalousiePositionUp = function () {
        var promise;

        promise = q();
        this.state.jalousiePosition = 0;
        this.publishStateChange();
        return promise;
    };

    /**
     *
     */
    Light.prototype.jalousiePositionDown = function () {
        var promise;

        promise = q();
        this.state.jalousiePosition = 100;
        this.publishStateChange();
        return promise;
    };

    /**
     *
     */
    Light.prototype.incrementJalousieRotation = function (){
        var promise;

        promise = q();
        this.state.jalousieRotation = (this.state.jalousieRotation > 160 ? 170 : this.state.jalousieRotation + 10);
        this.publishStateChange();
        return promise;
    };

    /**
     *
     */
    Light.prototype.decrementJalousieRotation = function (){
        var promise;

        promise = q();
        this.state.jalousieRotation = (this.state.jalousieRotation < 100 ? 90 : this.state.jalousieRotation - 10);
        this.publishStateChange();
        return promise;
    };

};
