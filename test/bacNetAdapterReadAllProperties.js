'use strict';
var q = require('q');
var BacNetAdapter = require('../lib/bacNetAdapter');

var ip = '192.168.0.105';
var deviceId = 1;
var objectId = 3;
var objectType = 'MultiStateValue';

var testDevice = BacNetAdapter.createDevice(ip + ':' + BacNetAdapter.BACNET_DEFAULT_PORT, ip,
    BacNetAdapter.BACNET_DEFAULT_PORT, deviceId, undefined, {objectId: deviceId});
var bacNetDeviceAdapter = BacNetAdapter.create();
var map = new Map();

bacNetDeviceAdapter.initialize(testDevice)
    .then(function (device) {
        console.log('!!!!!!! Device successfully initialized.');

        testDevice = device;
        var funcs = [];

        for (var i = 1; i < 255; i++) {
            bacNetDeviceAdapter.readPropertyById(objectType, objectId, i, device)
                .then(function (property) {
                        console.log('+++ ' + this.i);
                        console.log('+++ ' + property.propertyId);
                        map.set(this.i, property);
                    }.bind({i: i})
                );
        }
    })
    .delay(5000)
    .then(function(){
        console.log(map);
    }.bind(this));
