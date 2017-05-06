module.exports = {
    "label": "Default",
    "id": "default",
    "autoDiscoveryDeviceTypes": [],
    "devices": [
        {
            "plugin": "bacnet/bacNetDevice",
            "actors": [
                {
                    "id": "jalousie1",
                    "label": "Jalousie",
                    "type": "jalousie",
                    "logLevel": "debug",
                    "configuration": {
                        //"simulated": true,
                        "positionFeedbackObjectId": 62,
                        "positionFeedbackObjectType": "AnalogValue",
                        "positionModificationObjectId": 0,
                        "positionModificationObjectType": "AnalogValue",
                        "rotationFeedbackObjectId": 63,
                        "rotationFeedbackObjectType": "AnalogValue",
                        "rotationModificationObjectId": 0,
                        "rotationModificationObjectType": "AnalogValue",
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
                //"ipAddress": "192.168.5.102",
                "ipAddress": "192.168.0.185",
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