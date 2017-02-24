module.exports = {
    "label": "Default",
    "id": "default",
    "autoDiscoveryDeviceTypes": [],
    "devices": [
        {
            "plugin": "bacnet/bacNet",
            "actors": [
                {
                    "id": "binaryInput1",
                    "label": "Binary Input 1",
                    "type": "binaryInput",
                    "logLevel": "debug",
                    "configuration": {
                        "simulated": true,
                        "objectId": "22",
                        "objectType": "valve",
                        "objectName": "Air Supply 22",
                        "description": "Monitor the air supply in room 2 of the office."
                    }
                },
                {
                    "id": "binaryValue1",
                    "label": "Binary Value 1",
                    "type": "binaryValue",
                    "logLevel": "debug",
                    "configuration": {
                        "simulated": true,
                        "objectId": "23",
                        "objectType": "light",
                        "objectName": "Office Light 15",
                        "description": "Control light unit 15 on the ceiling in room 2 of the office."
                    }
                }],
            "sensors": [],
            "services": [],
            "class": "Device",
            "id": "bacnet1",
            "label": "BACnet 1",
            "configuration": {
                "simulated": true,
                "ipAddress": "192.168.0.1",
                "bacNetId": "12",
                "deviceId": "23"
            }
        }],
    "services": [],
    "eventProcessors": [],
    "groups": [],
    "jobs": [],
    "data": []
};