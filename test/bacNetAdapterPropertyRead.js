'use strict';
var BacNetAdapter = require('../lib/bacNetAdapter');

var ip = '192.168.0.185';
var testDevice = BacNetAdapter.createDevice(ip + ':' + BacNetAdapter.BACNET_DEFAULT_PORT, ip, BacNetAdapter.BACNET_DEFAULT_PORT);
var bacNetDeviceAdapter = BacNetAdapter.create();

bacNetDeviceAdapter.initialize(testDevice)
    .then(function (device) {
        testDevice = device;
        console.log('!!!!!!! Device successfully initialized.');

        return bacNetDeviceAdapter.readPropertyById('MultiStateValue', 3, BacNetAdapter.BACNET_PROPERTY_KEYS.objectName, device)
            .then(function (a) {
                console.log(a);
            })
            .fail(function (error) {
                console.log('Error: ' + error);
            })
            .done(function () {
                console.log('Done reading property.')
            })
    });
