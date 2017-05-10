'use strict';
var BacNetAdapter = require('../lib/bacNetAdapter');

var ip = '192.168.0.105';
var deviceId = 1;
var objectId = 3;
var objectType = 'MultiStateValue';
var propertyId = BacNetAdapter.BACNET_PROPERTY_KEYS.objectName;
var vendorId = 178;


var testDevice = BacNetAdapter.createDevice(ip + ':' + BacNetAdapter.BACNET_DEFAULT_PORT, ip,
    BacNetAdapter.BACNET_DEFAULT_PORT, deviceId, undefined, {objectId: deviceId});
var bacNetDeviceAdapter = BacNetAdapter.create();

bacNetDeviceAdapter.initialize(testDevice)
    .then(function (device) {
        testDevice = device;
        console.log('!!!!!!! Device successfully initialized.');
        var newId = testDevice.ip + ':' + testDevice.port;

        if (newId !== testDevice.id) {
            console.log('Id change from ' + testDevice.id + ' to ' + newId);
            testDevice.id = newId;
        }

        return bacNetDeviceAdapter.readPropertyById(objectType, objectId, propertyId, device)
            .then(function (a) {
                console.log(a);
            })
            .fail(function (error) {
                console.log('Error: ' + error);
            })
            .done(function () {
                console.log('Done reading property.')
            });
    });
