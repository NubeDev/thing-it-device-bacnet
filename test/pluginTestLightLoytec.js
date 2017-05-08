var q = require('q');
var assert = require("assert");


describe('[thing-it] BACnet Device', function () {
    var testDriver;
    var initialState;
    var lastState;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({logLevel: "debug"});

        testDriver.registerDevicePlugin(__dirname + "/../bacNetDevice");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/light");
        testDriver.start({
            configuration: require("../examples/configurationLoytecLight.js"),
            heartbeat: 10
        });

    });

    describe('Light', function () {
        describe('#start', function () {
            this.timeout(5000);

            it('should have received initial value via COV subscription for dimmerLevel and lightActive',
                function (done) {
                    setTimeout(function () {
                        var currentState = testDriver.BACnet.light.getState();
                        initialState = JSON.parse(JSON.stringify(currentState));
                        lastState = initialState;

                        try {
                            assert.notEqual(initialState.dimmerLevel, undefined, 'dimmerLevel undefined');
                            assert.notEqual(initialState.lightActive, undefined, 'lightActive undefined');
                            done();
                        } catch (err) {
                            console.log('ERROR DEBUG pluginTestJalousieLoytec: Initial state after 5s.', initialState);
                            done(err);
                        }
                    }, 3000);
                });
        });

        describe('#toggleLight', function () {
            this.timeout(5000);

            it('should invert the value of lightActive',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(initialState));
                    desiredState.lightActive = !lastState.lightActive;

                    testDriver.BACnet.light.toggleLight()
                        .delay(1000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.light.getState();
                            assert.equal(resultingState.lightActive, desiredState.lightActive);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });

            it('should invert the value of lightActive back to the original',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(initialState));
                    desiredState.lightActive = !lastState.lightActive;

                    testDriver.BACnet.light.toggleLight()
                        .delay(1000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.light.getState();
                            assert.equal(resultingState.lightActive, desiredState.lightActive);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });


        describe('#changeDimmer', function () {
            this.timeout(5000);

            it('should set lamp feedback to 75',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));
                    desiredState.dimmerLevel = 75;

                    testDriver.BACnet.light.changeDimmer({value: desiredState.dimmerLevel})
                        .delay(1000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.light.getState();
                            assert.equal(resultingState.dimmerLevel, desiredState.dimmerLevel);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });

            it('should set lamp feedback to 15',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));
                    desiredState.dimmerLevel = 15;

                    testDriver.BACnet.light.changeDimmer({value: desiredState.dimmerLevel})
                        .delay(1000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.light.getState();
                            assert.equal(resultingState.dimmerLevel, desiredState.dimmerLevel);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });

        describe('#setState', function () {
            this.timeout(5000);

            it('should set the device back to the initial state',
                function (done) {
                    var desiredState = initialState;

                    testDriver.BACnet.light.setState(desiredState)
                        .delay(2000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.light.getState();
                            assert.equal(resultingState.lightActive, desiredState.lightActive);
                            assert.equal(resultingState.dimmerLevel, desiredState.dimmerLevel);
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });
    })


    after(function () {
        testDriver.stop();
    });
});