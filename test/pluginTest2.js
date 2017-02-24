var assert = require("assert");

describe('[thing-it] BACnet Plugin', function () {
    var testDriver;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({logLevel: "error"});

        testDriver.registerDevicePlugin(__dirname + "/../bacNet");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/binaryInput");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/binaryValue");
    });
    describe('Start Configuration', function () {
        this.timeout(10000);

        it('should complete without error', function (done) {
            setTimeout(function () {
                done();
            }.bind(this), 5000);

            testDriver.start({
                configuration: require("../examples/configuration2.js"),
                heartbeat: 10
            });
        });
    });

    describe('Binary Input Listener', function () {
        this.timeout(20000);

        before(function () {
            testDriver.removeAllListeners();
        });
        it('should produce Actor State Change message', function (done) {
            testDriver.addListener({
                publishActorStateChange: function (device, actor, state) {
                    if (actor.id === "binaryInput1" && device.id === "bacnet1" && state.presentValue === true) {
                        done();
                    }

                }
            });

            testDriver.bacnet1.binaryInput1.update();
        });
    });

    describe('Binary Value Switch', function () {
        this.timeout(20000);

        before(function () {
            testDriver.removeAllListeners();
        });
        it('should produce Actor State Change message', function (done) {

            testDriver.addListener({
                publishActorStateChange: function (device, actor, state) {
                    if (actor.id === "binaryValue1" && device.id === "bacnet1" && state.presentValue === true) {
                        done();
                    }

                }
            });
            testDriver.bacnet1.binaryValue1.off()
                .then(function () {
                    testDriver.bacnet1.binaryValue1.on();
                });

        });
    });

});