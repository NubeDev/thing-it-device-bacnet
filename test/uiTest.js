angular.module('testApp', ['ThingItMobile.PluginDirectives'])
    .controller('TestController', function () {
        this.binary = {
            _state: {
                presentValue: false,
                alarmValue: false,
                outOfService: true
            }
        };

        this.analog = {
            _state: {
                presentValue: 21.45,
                alarmValue: true,
                outOfService: false
            },
            _configuration: {
                minValue: 10.0,
                maxValue: 30.0
            },

            changeValue: function (parameters) {
                console.log('Parameters', parameters);
            }
        };

        this.room = {
            _state: {
                presentValue: false,
                alarmValue: false,
                outOfService: true,
                temperature: 21.5,
                setpoint: 22,
                coolActive: true,
                position: 30,
                rotation: 45,
                lightActive: true,
                dimmerLevel: 75,
            },

            toggleLight: function () {
                this.room._state.lightActive = !this.room._state.lightActive;
            },

            changeDimmer: function (parameters) {
                console.log('New Dimmer Level', parameters);
            }
        };

        this.panel = {
            callActorService: function(controllerObject, controllerFunction, valueToSet) {
                console.log('Hellooooooo!!!!!');
                controllerObject[controllerFunction](valueToSet)
            }
        }

    });