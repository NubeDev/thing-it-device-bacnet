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
                        "positionFeedbackObjectId": 62,
                        "positionFeedbackObjectType": "AnalogValue",
                        "positionModificationObjectId": 58,
                        "positionModificationObjectType": "AnalogValue",
                        "positionStepSize": 10,
                        "rotationFeedbackObjectId": 63,
                        "rotationFeedbackObjectType": "AnalogValue",
                        "rotationModificationObjectId": 59,
                        "rotationModificationObjectType": "AnalogValue",
                        "rotationDownValue": 90,
                        "rotationUpValue": 0,
                        "rotationStepSize": 15,
                        "actionObjectId": 21,
                        "actionObjectType": "MultiStateValue",
                        "actionGoValue": 7,
                        "actionStopValue": 6,
                    }
                }

            ],
            "sensors": [],
            "services": [],
            "class": "Device",
            "id": "BACnet",
            "label": "BACnet",
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