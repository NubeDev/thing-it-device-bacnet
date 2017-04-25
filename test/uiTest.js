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
                setPoint: 22
            }
        };

        this.panel = {
            callActorService: function(controllerObject, controllerFunction, valueToSet) {
                console.log('Hellooooooo!!!!!');
                controllerObject[controllerFunction](valueToSet)
            }
        }

    });