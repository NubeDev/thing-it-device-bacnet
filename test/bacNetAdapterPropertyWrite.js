'use strict';
var BacNetAdapter = require('../lib/bacNetAdapter');

var ip = '192.168.0.105';
var deviceId = 101;
var objectId = 112;
var objectType = 'AnalogValue';
var propertyId = BacNetAdapter.BACNET_PROPERTY_KEYS.presentValue;


var testDevice = BacNetAdapter.createDevice(ip + ':' + BacNetAdapter.BACNET_DEFAULT_PORT, ip,
    BacNetAdapter.BACNET_DEFAULT_PORT, deviceId, undefined, {objectId: deviceId});
var bacNetDeviceAdapter = BacNetAdapter.create();

bacNetDeviceAdapter.initialize(testDevice)
    .then(function (device) {
        console.log('Performing WhoIs confirmation.');
        return bacNetDeviceAdapter.confirmViaWhoIs(device);
    }.bind(this))
    .then(function (device) {
        testDevice = device;
        console.log('!!!!!!! Device successfully initialized.');
        var newId = testDevice.ip + ':' + testDevice.port;

        if (newId !== testDevice.id) {
            console.log('Id change from ' + testDevice.id + ' to ' + newId);
            testDevice.id = newId;
        }

        return bacNetDeviceAdapter.writeProperty(objectType, objectId, 'presentValue', 20, device)
            .then(function (result) {
                console.log(result);
            })
            .delay(10000)
            .then(function (){
                return bacNetDeviceAdapter.writeProperty(objectType, objectId, 'presentValue', 80, device);
            })
            .then(function (result) {
                console.log(result);
            })
            .fail(function (error) {
                console.log('Error: ' + error);
            })
            .done(function () {
                console.log('Done writing property.');
            });
    });
