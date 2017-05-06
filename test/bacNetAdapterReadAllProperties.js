'use strict';
var q = require('q');
var BacNetAdapter = require('../lib/bacNetAdapter');

var ip = '192.168.0.185';
var objectType = 'MultiStateValue';
var objectId = 3;

var testDevice = BacNetAdapter.createDevice(ip + ':' + BacNetAdapter.BACNET_DEFAULT_PORT, ip, BacNetAdapter.BACNET_DEFAULT_PORT);
var bacNetDeviceAdapter = BacNetAdapter.create();
var map = new Map();

bacNetDeviceAdapter.initialize(testDevice)
    .then(function (device) {
        console.log('!!!!!!! Device successfully initialized.');

//        var promise = q();
        testDevice = device;
        var funcs = [];

        /*
         for (var i = 1; i < 50; i++) {
         funcs[i] = bacNetDeviceAdapter.readPropertyById;
         }

         for (var i = 1; i < 50; i++) {
         promise = promise.then(funcs[i](objectType, objectId, i, device))
         .then(function (a) {
         console.log('+++ ' + i);
         console.log('+++ ' + a.propertyId);
         map.set(a.propertyId, a);
         }.bind({i: i}))
         .delay(100);
         }
         */

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
