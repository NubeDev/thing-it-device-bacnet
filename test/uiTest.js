angular.module('testApp', [])
    .controller('TestController', function () {
        this.binary = {
            _state: {
                presentValue: false,
                alarmValue: true,
                outOfService: true
            }
        };

        this.analog = {
            _state: {
                presentValue: 77.77,
                alarmValue: true,
                outOfService: true
            }
        };

    });