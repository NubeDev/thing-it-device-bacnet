var BacNetAdapter = require('../lib/bacNetAdapter');


var testAdapter = BacNetAdapter.create();
testAdapter.initialize('192.168.0.108')
    .then(function () {
        //tests for read in the following order: binaryValue, analogValue, multiStateValue
        /*
        testAdapter.readProperty('BinaryValue', 12, 'presentValue')
            .then(function (a) {
                console.log(a);
            });
        testAdapter.readProperty('AnalogValue', 69, 'presentValue')
            .then(function (a) {
                console.log(a);
            });
        setTimeout(function () {
            testAdapter.readProperty('MultiStateValue', 26, 'presentValue')
                .then(function (a) {
                    console.log(a);
                });
        }.bind(this), 5000);
        */
        //tests for write in the following order: binaryValue, analogValue, multiStateValue
        /*
        testAdapter.writeProperty('BinaryValue', 12, 'presentValue', 0)
            .then(function (a) {
                console.log(a);
            });
        testAdapter.writeProperty('AnalogValue', 69, 'presentValue', 14.5)
            .then(function (a) {
                console.log(a);
            });
        testAdapter.writeProperty('MultiStateValue', 26, 'presentValue', 3)
            .then(function (a) {
                console.log(a);
            });
        */
        //tests for subscribe

        testAdapter.subscribeCOV('BinaryValue', 12, function (a) {
            console.log('a notification arrived');
            console.log(a);
        }).then(function (a) {
            console.log('successfully subscribed');
            console.log(a);
        });

        setTimeout(function () {
            testAdapter.writeProperty('BinaryValue', 12, 'presentValue', 0);
        }.bind(this), 10000);

        setTimeout(function () {
            testAdapter.unsubscribeCOV('BinaryValue', 12);
        }.bind(this), 20000);

        setTimeout(function () {
            testAdapter.writeProperty('BinaryValue', 12, 'presentValue', 1);
        }.bind(this), 30000);
    }.bind(this));
