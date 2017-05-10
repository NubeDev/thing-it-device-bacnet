'use strict';
var BacNetAdapter = require('../lib/bacNetAdapter');

var ip = '192.168.0.105';
var deviceId = 1;
var objectId = 21;
var objectType = 'MultiStateValue';
var propertyId = BacNetAdapter.BACNET_PROPERTY_KEYS.presentValue;


var testDevice = BacNetAdapter.createDevice(ip + ':' + BacNetAdapter.BACNET_DEFAULT_PORT, ip,
    BacNetAdapter.BACNET_DEFAULT_PORT, deviceId, undefined, {objectId: deviceId});
var bacNetDeviceAdapter = BacNetAdapter.create();

bacNetDeviceAdapter.initialize(testDevice)
    .then(function (device) {
        testDevice = device;
        console.log('!!!!!!! Device successfully initialized.');

        return bacNetDeviceAdapter.writeProperty(objectType, objectId, propertyId, 4, device)
            .then(function (result) {
                console.log(result);
            })
            .delay(1000)
            .then(function (){
                return bacNetDeviceAdapter.writeProperty(objectType, objectId, propertyId, 6, device);
            })
            .then(function (result) {
                console.log(result);
            })
            .fail(function (error) {
                console.log('Error: ' + error);
            })
            .done(function () {
                console.log('Done reading property.')
            });
    });
