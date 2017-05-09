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

        describe('#setModification', function () {
            this.timeout(15000);

            it('should set the value of position close to 50 and rotation close to 45 after 15s',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(initialState));
                    desiredState.position = 50;
                    desiredState.rotation = 45;
                    var tolerance = 5;
                    var minPosition = desiredState.position - tolerance;
                    var maxPosition = desiredState.position + tolerance;
                    var minRotation = desiredState.rotation - tolerance;
                    var maxRotation = desiredState.rotation + tolerance;

                    testDriver.BACnet.jalousie1.setModification(desiredState.position, desiredState.rotation)
                        .delay(10000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(((resultingState.position > minPosition) && (resultingState.position < maxPosition)),
                                'position of ' + resultingState.position + ' outside of tolerance ' +
                                minPosition + ' - ' + maxPosition);
                            assert.ok(((resultingState.rotation > minRotation) && (resultingState.rotation < maxRotation)),
                                'rotation of ' + resultingState.rotation + ' outside of tolerance ' +
                                minPosition + ' - ' + maxPosition);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });

        describe('#positionDown', function () {
            this.timeout(15000);

            it('should set the value of position to 100 after 15s',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(initialState));
                    desiredState.position = 100;
                    desiredState.rotation = testDriver.BACnet.jalousie1.configuration.rotationDownValue;

                    testDriver.BACnet.jalousie1.positionDown()
                        .delay(10000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.equal(resultingState.position, desiredState.position);
                            assert.equal(Math.round(resultingState.rotation), desiredState.rotation);
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
                    desiredState.rotation = testDriver.BACnet.jalousie1.configuration.rotationUpValue;

                    testDriver.BACnet.jalousie1.positionUp()
                        .delay(15000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.equal(resultingState.position, desiredState.position);
                            assert.equal(resultingState.rotation, desiredState.rotation);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });


        describe('#setModification', function () {
            this.timeout(15000);

            it('should set the value of position close to 50 and rotation close to 45 after 15s',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(initialState));
                    desiredState.position = 50;
                    desiredState.rotation = 45;
                    var tolerance = 5;
                    var minPosition = desiredState.position - tolerance;
                    var maxPosition = desiredState.position + tolerance;
                    var minRotation = desiredState.rotation - tolerance;
                    var maxRotation = desiredState.rotation + tolerance;

                    testDriver.BACnet.jalousie1.setModification(desiredState.position, desiredState.rotation)
                        .delay(10000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(((resultingState.position > minPosition) && (resultingState.position < maxPosition)),
                                'position of ' + resultingState.position + ' outside of tolerance ' +
                                minPosition + ' - ' + maxPosition);
                            assert.ok(((resultingState.rotation > minRotation) && (resultingState.rotation < maxRotation)),
                                'rotation of ' + resultingState.rotation + ' outside of tolerance ' +
                                minPosition + ' - ' + maxPosition);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });
        });

        describe('#incrementRotation', function () {
            this.timeout(5000);

            it('should increase the value of rotation ',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));
                    desiredState.rotation += testDriver.BACnet.jalousie1.configuration.rotationStepSize;
                    var tolerance = 2;
                    var minRotation = desiredState.rotation - tolerance;
                    var maxRotation = desiredState.rotation + tolerance;
                    var minPosition = desiredState.position - tolerance;
                    var maxPosition = desiredState.position + tolerance;

                    testDriver.BACnet.jalousie1.incrementRotation()
                        .delay(4000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(((resultingState.rotation > minRotation) && (resultingState.rotation < maxRotation)),
                                'rotation of ' + resultingState.rotation + ' outside of tolerance ' +
                                minRotation + ' - ' + maxRotation);
                            assert.ok(((resultingState.position > minPosition) && (resultingState.position < maxPosition)),
                                'position of ' + resultingState.position + ' outside of tolerance ' +
                                minPosition + ' - ' + maxPosition);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });

        });

        describe('#decrementRotation', function () {
            this.timeout(5000);

            it('should decrease the value of rotation ',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));
                    desiredState.rotation -= testDriver.BACnet.jalousie1.configuration.rotationStepSize;
                    var tolerance = 5;
                    var minRotation = desiredState.rotation - tolerance;
                    var maxRotation = desiredState.rotation + tolerance;
                    var minPosition = desiredState.position - tolerance;
                    var maxPosition = desiredState.position + tolerance;

                    testDriver.BACnet.jalousie1.decrementRotation()
                        .delay(4000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(((resultingState.rotation > minRotation) && (resultingState.rotation < maxRotation)),
                                'rotation of ' + resultingState.rotation + ' outside of tolerance ' +
                                minRotation + ' - ' + maxRotation);
                            assert.ok(((resultingState.position > minPosition) && (resultingState.position < maxPosition)),
                                'position of ' + resultingState.position + ' outside of tolerance ' +
                                minPosition + ' - ' + maxPosition);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });

        });

        describe('#raisePosition', function () {
            this.timeout(20000);

            it('should decrease the value of position by step size and set rotation up value',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));
                    desiredState.position -= testDriver.BACnet.jalousie1.configuration.positionStepSize;
                    var tolerance = 2;
                    var minPosition = desiredState.position - tolerance;
                    var maxPosition = desiredState.position + tolerance;
                    desiredState.rotation = testDriver.BACnet.jalousie1.configuration.rotationUpValue;

                    testDriver.BACnet.jalousie1.raisePosition()
                        .delay(4000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(((resultingState.position > minPosition) && (resultingState.position < maxPosition)),
                                'position of ' + resultingState.position + ' outside of tolerance ' +
                                minPosition + ' - ' + maxPosition);
                            assert.equal(Math.round(resultingState.rotation), desiredState.rotation);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });

            it('should decrease the value of position a second time and set rotation up value',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));
                    desiredState.position -= testDriver.BACnet.jalousie1.configuration.positionStepSize;
                    var tolerance = 2;
                    var minPosition = desiredState.position - tolerance;
                    var maxPosition = desiredState.position + tolerance;
                    desiredState.rotation = testDriver.BACnet.jalousie1.configuration.rotationUpValue;

                    testDriver.BACnet.jalousie1.raisePosition()
                        .delay(4000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(((resultingState.position > minPosition) && (resultingState.position < maxPosition)),
                                'position of ' + resultingState.position + ' outside of tolerance ' +
                                minPosition + ' - ' + maxPosition);
                            assert.equal(Math.round(resultingState.rotation), desiredState.rotation);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });

            it('should decrease the value of position a third time and set rotation up value',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));
                    desiredState.position -= testDriver.BACnet.jalousie1.configuration.positionStepSize;
                    var tolerance = 2;
                    var minPosition = desiredState.position - tolerance;
                    var maxPosition = desiredState.position + tolerance;
                    desiredState.rotation = testDriver.BACnet.jalousie1.configuration.rotationUpValue;

                    testDriver.BACnet.jalousie1.raisePosition()
                        .delay(4000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(((resultingState.position > minPosition) && (resultingState.position < maxPosition)),
                                'position of ' + resultingState.position + ' outside of tolerance ' +
                                minPosition + ' - ' + maxPosition);
                            assert.equal(Math.round(resultingState.rotation), desiredState.rotation);
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

            it('should increase the value of position and set rotation down value initially',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));
                    desiredState.position += testDriver.BACnet.jalousie1.configuration.positionStepSize;
                    var tolerance = 2;
                    var minPosition = desiredState.position - tolerance;
                    var maxPosition = desiredState.position + tolerance;
                    desiredState.rotation = testDriver.BACnet.jalousie1.configuration.rotationDownValue;

                    testDriver.BACnet.jalousie1.lowerPosition()
                        .delay(4000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(((resultingState.position > minPosition) && (resultingState.position < maxPosition)),
                                'position of ' + resultingState.position + ' outside of tolerance ' +
                                minPosition + ' - ' + maxPosition);
                            assert.equal(Math.round(resultingState.rotation), desiredState.rotation);
                            lastState = resultingState;
                            done();
                        })
                        .fail(function (error) {
                            done(error);
                        });
                });

            it('should increase the value of position and set rotation down value a second time',
                function (done) {
                    var desiredState = JSON.parse(JSON.stringify(lastState));
                    desiredState.position += testDriver.BACnet.jalousie1.configuration.positionStepSize;
                    var tolerance = 2;
                    var minPosition = desiredState.position - tolerance;
                    var maxPosition = desiredState.position + tolerance;
                    desiredState.rotation = testDriver.BACnet.jalousie1.configuration.rotationDownValue;

                    testDriver.BACnet.jalousie1.lowerPosition()
                        .delay(4000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(((resultingState.position > minPosition) && (resultingState.position < maxPosition)),
                                'position of ' + resultingState.position + ' outside of tolerance ' +
                                minPosition + ' - ' + maxPosition);
                            assert.equal(Math.round(resultingState.rotation), desiredState.rotation);
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
                    var tolerance = 5;
                    var minPosition = desiredState.position - tolerance;
                    var maxPosition = desiredState.position + tolerance;
                    var minRotation = desiredState.rotation - tolerance;
                    var maxRotation = desiredState.rotation + tolerance;

                    testDriver.BACnet.jalousie1.setState(desiredState)
                        .delay(15000)
                        .then(function () {
                            var resultingState = testDriver.BACnet.jalousie1.getState();
                            assert.ok(((resultingState.position > minPosition) && (resultingState.position < maxPosition)),
                                'position of ' + resultingState.position + ' outside of tolerance ' +
                                minPosition + ' - ' + maxPosition);
                            assert.ok(((resultingState.rotation > minRotation) && (resultingState.rotation < maxRotation)),
                                'rotation of ' + resultingState.rotation + ' outside of tolerance ' +
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