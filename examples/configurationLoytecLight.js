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