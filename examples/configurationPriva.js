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
            "id": "BACnet",
            "label": "BACnet",
            "configuration": {
                "ipAddress": "192.168.5.192",
                "ipMatchRequired": true,
                "bacNetId": "1",
                "deviceId": 101,
                "deviceIdMatchRequired": true,
                "vendorId": 0,
                "vendorIdMatchRequired": false,
            }
        }],
    "services": [],
    "eventProcessors": [],
    "groups": [],
    "jobs": [],
    "data": []
};