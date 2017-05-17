'use strict';
var BacNetAdapter = require('../lib/bacNetAdapter');

//var ip = '192.168.0.105'; 178.8.237.219
var ip = '178.8.237.219';
var deviceId = 101;
var objectId = 112;
//var objectType = 'MultiStateValue';
var objectType = 'AnalogValue';
var propertyId = BacNetAdapter.BACNET_PROPERTY_KEYS.presentValue;
var vendorId = 178;


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

        return bacNetDeviceAdapter.readPropertyById(objectType, objectId, propertyId, device)
            .then(function (a) {
                console.log(a);
            })
            .fail(function (error) {
                console.log('Error: ' + error);
            })
            .done(function () {
                console.log('Done reading property.');
            });
    })
    .fail(function (error) {
        console.log(error);
    })
    .done();
