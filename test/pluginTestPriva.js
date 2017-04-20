var assert = require("assert");

describe('[thing-it] BACnet Device', function () {
    var testDriver;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({logLevel: "error"});

        testDriver.registerDevicePlugin(__dirname + "/../bacNetDevice");
        //testDriver.registerUnitPlugin(__dirname + "/../default-units/binaryInput");
        //testDriver.registerUnitPlugin(__dirname + "/../default-units/binaryValue");
        //testDriver.registerUnitPlugin(__dirname + "/../default-units/analogInput");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/analogValue");

    });
    describe('Start Configuration', function () {
        this.timeout(10000);

        it('should complete without error', function (done) {
            setTimeout(function () {
                done();
            }.bind(this), 5000);

            testDriver.start({
                configuration: require("../examples/configurationPriva.js"),
                heartbeat: 10
            });
        });
    });



    describe('Analog Value Test Update', function () {
        this.timeout(20000);

        before(function () {
            testDriver.removeAllListeners();
        });
        it('should execute the update service successfully', function (done) {
            testDriver.bacnet1.analogValue1.update()
                .then(function() {
                    done();
                });
        });
    });


    describe('Analog Value Test setPresentValue and Notification', function () {
        this.timeout(20000);

        before(function () {
            testDriver.removeAllListeners();
        });
        it('should set the present value and produce Actor State Change message', function (done) {

            testDriver.addListener({
                publishActorStateChange: function (device, actor, state) {
                    if (actor.id === "analogValue1" && device.id === "bacnet1") {
                        done();
                    }

                }
            });

            testDriver.bacnet1.analogValue1.setPresentValue(Math.random() * 100);
        });
    });


/*
    describe('Stop Configuration', function () {
        this.timeout(10000);

        it('should complete without error', function (done) {
            setTimeout(function () {
                done();
            }.bind(this), 5000);

            testDriver.stop();
        });
    });
*/
});