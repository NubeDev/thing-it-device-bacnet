module.exports = {
    "label": "Default",
    "id": "default",
    "autoDiscoveryDeviceTypes": [],
    "devices": [
        {
            "plugin": "bacnet/bacNetDevice",
            "actors": [
/*
                {
                    "id": "roomControl1",
                    "label": "Room Control",
                    "type": "roomControl",
                    "logLevel": "debug",
                    "configuration": {
                        //"simulated": true,
                        "setpointFeedbackObjectId": 20,
                        "setpointFeedbackObjectType": "AnalogValue",
                        "temperatureObjectId": 24,
                        "temperatureObjectType": "AnalogValue",
                        "setpointModificationObjectId": 32,
                        "setpointModificationObjectType": "AnalogValue",
                    }
                },
*/
                {
                    "id": "thermostat1",
                    "label": "Thermostat",
                    "type": "thermostat",
                    "logLevel": "debug",
                    "configuration": {
                        //"simulated": true,
                        "setpointFeedbackObjectId": 20,
                        "setpointFeedbackObjectType": "AnalogValue",
                        "temperatureObjectId": 24,
                        "temperatureObjectType": "AnalogValue",
                        "setpointModificationObjectId": 32,
                        "setpointModificationObjectType": "AnalogValue",
                    }
                }

            ],
            "sensors": [],
            "services": [],
            "class": "Device",
            "id": "LoytecBACnet",
            "label": "Loytec BACnet",
            "configuration": {
                //"simulated": true,
                "ipAddress": "192.168.5.102",
                "bacNetId": "1",
                "deviceId": "1"
            }
        }],
    "services": [],
    "eventProcessors": [],
    "groups": [],
    "jobs": [],
    "data": []
};