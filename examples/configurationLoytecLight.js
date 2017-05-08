module.exports = {
    "label": "Default",
    "id": "default",
    "autoDiscoveryDeviceTypes": [],
    "devices": [
        {
            "plugin": "bacnet/bacNetDevice",
            "actors": [
                {
                    "id": "light",
                    "label": "Light",
                    "type": "light",
                    "logLevel": "debug",
                    "configuration": {
                        "levelFeedbackObjectId": 43,
                        "levelFeedbackObjectType": "AnalogValue",
                        "levelModificationObjectId": 38,
                        "levelModificationObjectType": "AnalogValue",
                        "lightActiveFeedbackObjectId": 15,
                        "lightActiveFeedbackObjectType": "MultiStateValue",
                        "lightActiveModificationObjectId": 14,
                        "lightActiveModificationObjectType": "MultiStateValue",
                        "lightActiveModificationValueOn": 2,
                        "lightActiveModificationValueOff": 1,
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