var BacNetAdapter = require('../lib/bacNetAdapter');

var bacNetDeviceAdapter = BacNetAdapter.create();
//bacNetDeviceAdapter.initialize('192.168.5.192')
bacNetDeviceAdapter.initialize('192.168.0.185')
    .then(function () {


        bacNetDeviceAdapter.readProperty('AnalogValue', 20, 'presentValue')
            .then(function (a) {
                console.log(a);
            });

        /*
         for (i = 20; i < 21; i++) {
         bacNetDeviceAdapter.subscribeCOV('AnalogValue', i, function (a) {
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
         .done(function (message){
         console.log("bacNetAdapterTest: Done subscribing.");
         })
         }
         */

        /*
         bacNetDeviceAdapter.readProperty('Device', 1, 'objectList').then(function (result) {
         console.log(result);
         });
         */


        /*
         //Example setting the Ventil Maximum Regelbereich
         bacNetDeviceAdapter.writeProperty('AnalogValue', 112, 'presentValue', 20)
         .then(function (a) {
         console.log(a);
         });
         */


        /*
         bacNetDeviceAdapter.unsubscribeCOV('AnalogValue', 31);
         */

    }.bind(this));


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