var q = require('q');
var assert = require("assert");


describe('[thing-it] BACnet Device', function () {
    var testDriver;
    var initialState;
    var lastState;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({logLevel: "debug"});

        testDriver.registerDevicePlugin(__dirname + "/../bacNetDevice");
        testDriver.registerUnitPlugin(__dirname + "/../default-units/thermostat");
        testDriver.start({
            configuration: require("../examples/configurationLoytecThermostat.js"),
            heartbeat: 10
        });

    });

    describe('Thermostat', function () {
        describe('#start', function () {
            this.timeout(5000);

            it('should have received initial value via COV subscription for setpoint, temperature, and mode',
                function (done) {
                    setTimeout(function () {
                        var currentState = testDriver.BACnet.thermostat1.getState();
                        initialState = JSON.parse(JSON.stringify(currentState));

                        try {
                            assert.notEqual(initialState.setpoint, undefined, 'setpoint undefined');
                            assert.notEqual(initialState.temperature, undefined, 'temperature undefined');
                            assert.notEqual(initialState.mode, undefined, 'mode undefined');
                            done();
                        } catch (err) {
                            console.log('ERROR DEBUG pluginTestRoomControlLoytec: Initial state after 5s.', initialState);
                            done(err);
                        }
                    }, 3000);
                });
        });

        describe('#incrementSetpoint', function () {
            it('should increase the setpoint modification and the setpoint by 1',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(initialState));
                    desiredState.setpoint += 1;

                    testDriver.BACnet.thermostat1.incrementSetpoint()
                        .then(function () {
                            var resultingState = testDriver.BACnet.thermostat1.getState();
                            assert.equal(resultingState.setpoint, desiredState.setpoint);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });

        describe('#decrementSetpoint twice', function () {
            this.timeout(4000);

            it('should decrease the setpoint modification and the setpoint by 2',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));
                    desiredState.setpoint -= 2;

                    testDriver.BACnet.thermostat1.decrementSetpoint()
                        .then(function () {
                            return testDriver.BACnet.thermostat1.decrementSetpoint();
                        })
                        .then(function () {
                            var resultingState = testDriver.BACnet.thermostat1.getState();
                            assert.equal(resultingState.setpoint, desiredState.setpoint);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });


        describe('#setState', function () {
            this.timeout(4000);

            it('should set the device back to the initial state',
                function (done) {
                    var desiredState = initialState;

                    testDriver.BACnet.thermostat1.setState(desiredState)
                        .then(function () {
                            var resultingState = testDriver.BACnet.thermostat1.getState();
                            assert.equal(resultingState.setpoint, desiredState.setpoint);
                            assert.equal(resultingState.temperature, desiredState.temperature);
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