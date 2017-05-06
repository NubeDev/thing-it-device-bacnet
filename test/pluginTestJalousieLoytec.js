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
                        var currentState = testDriver.BACnet.jalousie1.getState();
                        initialState = JSON.parse(JSON.stringify(currentState));
                        lastState = initialState;

                        try {
                            assert.notEqual(initialState.position, undefined, 'position undefined');
                            assert.notEqual(initialState.rotation, undefined, 'rotation undefined');
                            done();
                        } catch (err) {
                            console.log('ERROR DEBUG pluginTestJalousieLoytec: Initial state after 5s.', initialState);
                            done(err);
                        }
                    }, 3000);
                });
        });

        describe('#positionDown', function () {
            this.timeout(20000);

            it('should set the value of position to 100 after 15s',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(initialState));
                    desiredState.position = 100;

                    testDriver.BACnet.jalousie1.positionDown()
                        .delay(15000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.equal(resultingState.position, desiredState.position);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });


        describe('#raisePosition', function () {
            this.timeout(5000);

            it('should decrease the value of position initially',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));

                    testDriver.BACnet.jalousie1.raisePosition()
                        .delay(1000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(resultingState.position < desiredState.position,
                                'Resulting position too high. Is ' + resultingState.position +
                                ' while should be lower than ' + desiredState.position);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });

            it('should decrease the value of position a second time',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));

                    testDriver.BACnet.jalousie1.raisePosition()
                        .delay(1000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(resultingState.position < desiredState.position,
                                'Resulting position too high. Is ' + resultingState.position +
                                ' while should be lower than ' + desiredState.position);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });

            it('should decrease the value of position a third time',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));

                    testDriver.BACnet.jalousie1.raisePosition()
                        .delay(1000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(resultingState.position < desiredState.position,
                                'Resulting position too high. Is ' + resultingState.position +
                                ' while should be lower than ' + desiredState.position);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });

        describe('#lowerPosition', function () {
            this.timeout(5000);

            it('should increase the value of position',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));

                    testDriver.BACnet.jalousie1.lowerPosition()
                        .delay(1000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(resultingState.position > desiredState.position,
                                'Resulting position too high. Is ' + resultingState.position +
                                ' while should be lower than ' + desiredState.position);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });


        describe('#positionUp', function () {
            this.timeout(20000);

            it('should set the value of position to 0 after 15s',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));
                    desiredState.position = 0;

                    testDriver.BACnet.jalousie1.positionUp()
                        .delay(15000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.equal(resultingState.position, desiredState.position);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });


        describe('#setState', function () {
            this.timeout(20000);

            it('should set the device back to the initial state',
                function (done) {
                    var desiredState = initialState;
                    var tolerance = 10;
                    var minPosition = initialState.position - tolerance;
                    var maxPosition = initialState.position + tolerance;

                    testDriver.BACnet.jalousie1.setState(desiredState)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(((resultingState.position > minPosition) && (resultingState.position < maxPosition)),
                                'position of ' + resultingState.position + ' outside of tolerance ' +
                                minPosition + ' - ' + maxPosition);
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