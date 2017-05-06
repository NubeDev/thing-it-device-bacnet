var q = require('q');
var assert = require("assert");


describe('[thing-it] BACnet Device', function () {
    var testDriver;
    var initialState;
    var lastState;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({logLevel: "debug"});

        testDriver.registerDevicePlugin(__dirname + "/../bacNetDevice");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/jalousie");
        testDriver.start({
            configuration: require("../examples/configurationLoytecJalousie.js"),
            heartbeat: 10
        });

    });

    describe('Jalousie', function () {
        describe('#start', function () {
            this.timeout(5000);

            it('should have received initial value via COV subscription for position and rotation',
                function (done) {
                    setTimeout(function () {
                        var currentState = testDriver.LoytecBACnet.jalousie1.getState();
                        initialState = JSON.parse(JSON.stringify(currentState));

                        try {
                            assert.notEqual(initialState.position, undefined, 'position undefined');
                            assert.notEqual(initialState.rotation, undefined, 'temperature undefined');
                            done();
                        } catch (err) {
                            console.log('ERROR DEBUG pluginTestJalousieLoytec: Initial state after 5s.', initialState);
                            done(err);
                        }
                    }, 3000);
                });
        });

        describe.skip('#raisePosition', function () {
            it('should decrease the position % by 10',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(initialState));
                    desiredState.position += 10;

                    testDriver.LoytecBACnet.jalousie1.raisePosition()
                        .then(function () {
                            var resultingState = testDriver.LoytecBACnet.jalousie1.getState();
                            assert.equal(resultingState.position, desiredState.position);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        })
                })
        });

        describe.skip('#decrementSetpoint twice', function () {
            this.timeout(4000);

            it('should decrease the setpoint modification and the setpoint by 2',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));
                    desiredState.setpoint -= 2;

                    testDriver.LoytecBACnet.jalousie1.decrementSetpoint()
                        .then(function () {
                            return testDriver.LoytecBACnet.jalousie1.decrementSetpoint();
                        })
                        .then(function () {
                            var resultingState = testDriver.LoytecBACnet.jalousie1.getState();
                            assert.equal(resultingState.setpoint, desiredState.setpoint);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        })
                })
        });


        describe.skip('#setState', function () {
            this.timeout(4000);

            it('should set the device back to the initial state',
                function (done) {
                    var desiredState = initialState;

                    testDriver.LoytecBACnet.jalousie1.setState(desiredState)
                        .then(function () {
                            var resultingState = testDriver.LoytecBACnet.jalousie1.getState();
                            assert.equal(resultingState.setpoint, desiredState.setpoint);
                            assert.equal(resultingState.temperature, desiredState.temperature);
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        })
                })
        });
    })


    after(function () {
        testDriver.stop();
    });
});