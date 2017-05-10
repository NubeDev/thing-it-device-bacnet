module.exports = {
    "label": "Default",
    "id": "default",
    "autoDiscoveryDeviceTypes": [],
    "devices": [
        {
            "plugin": "bacnet/bacNetDevice",
            "actors": [
                {
                    "id": "thermostat1",
                    "label": "Thermostat",
                    "type": "thermostat",
                    "logLevel": "debug",
                    "configuration": {
                        //"simulated": true,
                        "setpointFeedbackObjectId": 20,
                        "setpointFeedbackObjectType": "AnalogValue",
                        "setpointModificationObjectId": 32,
                        "setpointModificationObjectType": "AnalogValue",
                        "temperatureObjectId": 24,
                        "temperatureObjectType": "AnalogValue",
                        "modeObjectId": 3,
                        "modeObjectType": "MultiStateValue",
                    }
                }

            ],
            "sensors": [],
            "services": [],
            "class": "Device",
            "id": "BACnet",
            "label": "BACnet",
            "configuration": {
                "ipAddress": "192.168.0.185",
                "ipMatchRequired": true,
                "bacNetId": "1",
                "deviceId": 1,
                "deviceIdMatchRequired": true,
                "vendorId": 179,
                "vendorIdMatchRequired": false,
            }
        }],
    "services": [],
    "eventProcessors": [],
    "groups": [],
    "jobs": [],
    "data": []
};