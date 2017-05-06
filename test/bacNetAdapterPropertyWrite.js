'use strict';
var BacNetAdapter = require('../lib/bacNetAdapter');

var ip = '192.168.0.185';
var testDevice = BacNetAdapter.createDevice(ip + ':' + BacNetAdapter.BACNET_DEFAULT_PORT, ip, BacNetAdapter.BACNET_DEFAULT_PORT);
var bacNetDeviceAdapter = BacNetAdapter.create();

bacNetDeviceAdapter.initialize(testDevice)
    .then(function (device) {
        testDevice = device;
        console.log('!!!!!!! Device successfully initialized.');

        return bacNetDeviceAdapter.writeProperty('MultiStateValue', 21, 'presentValue', 4, device)
            .then(function (result) {
                console.log(result);
            })
            .delay(1000)
            .then(function (){
                return bacNetDeviceAdapter.writeProperty('MultiStateValue', 21, 'presentValue', 6, device);
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
