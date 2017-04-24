var BacNetAdapter = require('../lib/bacNetAdapter');

var ip = '192.168.5.102';
var firstTestDevice = BacNetAdapter.createDevice(ip + ':' + BacNetAdapter.BACNET_DEFAULT_PORT, ip, BacNetAdapter.BACNET_DEFAULT_PORT);
ip = '192.168.5.192';
var secondTestDevice = BacNetAdapter.createDevice(ip + ':' + BacNetAdapter.BACNET_DEFAULT_PORT, ip, BacNetAdapter.BACNET_DEFAULT_PORT);
var bacNetDeviceAdapter = BacNetAdapter.create();

bacNetDeviceAdapter.initialize(firstTestDevice)
//bacNetDeviceAdapter.initialize('192.168.0.185')
    .then(function (device) {
            firstTestDevice = device;
            console.log('!!!!!!! First Device successfully initialized.');


            /*
             bacNetDeviceAdapter.readProperty('MultiStateInput', 3, 'presentValue')
             .then(function (a) {
             console.log(a);
             })
             .fail(function (error) {
             console.log('Error: ' + error);
             })
             .done(function () {
             console.log('Done reading property.')
             });
             */

            /*
             bacNetDeviceAdapter.readProperty('AnalogValue', 20, 'presentValue')
             .then(function (a) {
             console.log(a);
             });
             */

            /*
             for (i = 10; i < 50; i++) {
             bacNetDeviceAdapter.subscribeCOV('AnalogValue', i, firstTestDevice.ip, firstTestDevice.port, function (a) {
             console.log('bacNetAdapterTest: Change of Value: "'
             + a.propertyValue + '" value for propertyId ' + a.propertyId
             + ' from objectId ' + a.objectId + ' of objectType ' + a.objectType);
             //console.log(a);
             })
             .then(function (a) {
             console.log('bacNetAdapterTest: Successfully subscribed to COV for object id ' + a.objectId
             + ' of objectType ' + a.objectType);
             //console.log(a);
             })
             .fail(function (message) {
             console.log('bacNetAdapterTest: Error subscribing to COV: ' + message)
             })
             .fin(function (message) {
             console.log("bacNetAdapterTest: Done subscribing.");
             })
             .done();
             }
             */

            /*
             bacNetDeviceAdapter.readProperty('Device', 1, 'objectList').then(function (result) {
             console.log(result);
             });
             */


            //Example setting the Ventil Maximum Regelbereich
            var thisObjectId = 32;
            var thisValue = 0;

            bacNetDeviceAdapter.subscribeCOV('AnalogValue', thisObjectId, firstTestDevice, function (a) {
                console.log('!!!!!!! Change of Value: "'
                    + a.propertyValue + '" value for propertyId ' + a.propertyId
                    + ' from objectId ' + a.objectId + ' of objectType ' + a.objectType);
                //console.log(a);
            })
                .then(function (a) {
                    console.log('!!!!!!! Successfully subscribed to COV for object id ' + a.objectId
                        + ' of objectType ' + a.objectType);
                    //console.log(a);

                    return bacNetDeviceAdapter.readProperty('AnalogValue', thisObjectId, 'presentValue', firstTestDevice)
                        .then(function (a) {
                            console.log('!!!!!!! Read:');
                            console.log(a);
                        })
                        .then(function () {
                            return bacNetDeviceAdapter.writeProperty('AnalogValue', thisObjectId, 'presentValue', thisValue, firstTestDevice)
                        })
                        .then(function (a) {
                            console.log('!!!!!!! Wrote:');
                            console.log(a);
                        })
                        .then(function () {
                            return bacNetDeviceAdapter.readProperty('AnalogValue', thisObjectId, 'presentValue', firstTestDevice)
                        })
                        .then(function (a) {
                            console.log('!!!!!!! Read:');
                            console.log(a);
                        })
                        .delay(20000)
                        .then(function (a) {
                            return bacNetDeviceAdapter.unsubscribeCOV('AnalogValue', thisObjectId, firstTestDevice);
                        })
                        .then(function (a) {
                            console.log('!!!!!!! Un-subscribed:');
                            console.log(a);
                        });
                })
                .fail(function (message) {
                    console.log('!!!!!!! Error subscribing to COV: ' + message)
                })
                .fin(function (message) {
                    console.log("!!!!!!! Done subscribing.");
                })
                .done();


            /*
             bacNetDeviceAdapter.unsubscribeCOV('AnalogValue', 31);
             */

        }.bind(this)
    );

bacNetDeviceAdapter.initialize(secondTestDevice)
    .then(function (a) {
        console.log('****** Second Device successfully initialized.');
    })
    .then(function () {
        return bacNetDeviceAdapter.writeProperty('AnalogValue', 112, 'presentValue', 81, secondTestDevice)
            .then(function (result) {
                console.log('****** Result');
                console.log(result)
                console.log('****** Result');
            })

        /*
         for (i = 1; i < 50; i++) {
         bacNetDeviceAdapter.subscribeCOV('AnalogValue', i, secondTestDevice.ip, secondTestDevice.port, function (a) {
         console.log('****** Change of Value: "'
         + a.propertyValue + '" value for propertyId ' + a.propertyId
         + ' from objectId ' + a.objectId + ' of objectType ' + a.objectType);
         //console.log(a);
         })
         .then(function (a) {
         console.log('****** Successfully subscribed to COV for object id ' + a.objectId
         + ' of objectType ' + a.objectType);
         //console.log(a);
         })
         .fail(function (message) {
         console.log('****** Error subscribing to COV: ' + message)
         })
         .fin(function (message) {
         console.log("****** Done subscribing.");
         })
         .done();
         }
         */
    })
    .fail(function (error) {
        console.log('****** Error in second test device: ' + error);
    })
    .fin(function () {
        console.log('****** Done with second device.');
    })
    .done();

/*
 var loytec = BacNetAdapter.create();
 loytec.initialize('192.168.5.104')
 .then(function () {
 //tests for read in the following order: binaryValue, analogValue, multiStateValue

 loytec.readProperty('BinaryValue', 12, 'presentValue')
 .then(function (a) {
 console.log(a);
 });
 loytec.readProperty('AnalogValue', 69, 'presentValue')
 .then(function (a) {
 console.log(a);
 });
 setTimeout(function () {
 loytec.readProperty('MultiStateValue', 26, 'presentValue')
 .then(function (a) {
 console.log(a);
 });
 }.bind(this), 5000);

 //tests for write in the following order: binaryValue, analogValue, multiStateValue

 loytec.writeProperty('BinaryValue', 12, 'presentValue', 0)
 .then(function (a) {
 console.log(a);
 });
 loytec.writeProperty('AnalogValue', 69, 'presentValue', 14.5)
 .then(function (a) {
 console.log(a);
 });
 loytec.writeProperty('MultiStateValue', 26, 'presentValue', 3)
 .then(function (a) {
 console.log(a);
 });

 //tests for subscribe


 loytec.subscribeCOV('BinaryValue', 12, function (a) {
 console.log('a notification arrived');
 console.log(a);
 }).then(function (a) {
 console.log('successfully subscribed');
 console.log(a);
 });

 setTimeout(function () {
 loytec.writeProperty('BinaryValue', 12, 'presentValue', 0);
 }.bind(this), 10000);

 setTimeout(function () {
 loytec.unsubscribeCOV('BinaryValue', 12);
 }.bind(this), 20000);

 setTimeout(function () {
 loytec.writeProperty('BinaryValue', 12, 'presentValue', 1);
 }.bind(this), 30000);

 }.bind(this));
 */