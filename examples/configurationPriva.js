module.exports = {
    "label": "Default",
    "id": "default",
    "autoDiscoveryDeviceTypes": [],
    "devices": [
        {
            "plugin": "bacnet/bacNetDevice",
            "actors": [
                {
                    "id": "analogValue1",
                    "label": "Analog Value 1",
                    "type": "analogValue",
                    "logLevel": "debug",
                    "configuration": {
                        //"simulated": true,
                        "objectId": "112",
                        "objectType": "AnalogValue",
                        "objectName": "vmr",
                        "description": "Ventil Maximum Regelbereich",
                        "minValue": 0,
                        "maxValue": 100
                    }
                }
            ],
            "sensors": [],
            "services": [],
            "class": "Device",
            "id": "bacnet1",
            "label": "PRIVA",
            "configuration": {
                //"simulated": true,
                "ipAddress": "192.168.5.192",
                "bacNetId": "101",
                "deviceId": "101"
            }
        }],
    "services": [],
    "eventProcessors": [],
    "groups": [],
    "jobs": [],
    "data": []
};