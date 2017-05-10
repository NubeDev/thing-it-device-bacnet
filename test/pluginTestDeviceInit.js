var q = require('q');
var assert = require("assert");


describe('[thing-it] BACnet Device', function () {
    var testDriver;

    before(function () {
        testDriver = require("thing-it-test").createTestDriver({logLevel: "debug"});

        testDriver.registerDevicePlugin(__dirname + "/../bacNetDevice");
        testDriver.start({
            configuration: require("../examples/configurationLoytecDevice.js"),
            heartbeat: 10
        });

    });

    describe('Device', function () {
        describe('#start', function () {
            this.timeout(5000);

            it('should have completed initialization successfully',
                function (done) {
                    setTimeout(function () {
                        assert.ok(testDriver.BACnet.state.initialized, 'bacNetDevice not initialized');
                        done();
                    }, 3000);
                });
        });
    });


    after(function () {
        testDriver.stop();
    });
});