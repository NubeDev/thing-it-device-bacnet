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
                    "id": "binaryInput1",
                    "label": "Binary Input 1",
                    "type": "binaryInput",
                    "logLevel": "debug",
                    "configuration": {
                        //"simulated": true,
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
                        //"simulated": true,
                        "objectId": "23",
                        "objectType": "light",
                        "objectName": "Office Light 15",
                        "description": "Control light unit 15 on the ceiling in room 2 of the office."
                    }
                },
                {
                    "id": "analogInput1",
                    "label": "Analog Input 1",
                    "type": "analogInput",
                    "logLevel": "debug",
                    "configuration": {
                        //"simulated": true,
                        "objectId": "102",
                        "objectType": "temperature",
                        "objectName": "Temperature Sensor 102",
                        "description": "Monitors the temperature in room 2 of the office."
                    }
                },*/
                {
                    "id": "analogValue1",
                    "label": "Analog Value 1",
                    "type": "analogValue",
                    "logLevel": "debug",
                    "configuration": {
                        //"simulated": true,
                        "objectId": "69",
                        "objectType": "AnalogValue",
                        "objectName": "spExt",
                        "description": "External setpoint write"
                    }
                }
            ],
            "sensors": [],
            "services": [],
            "class": "Device",
            "id": "bacnet1",
            "label": "BACnet 1",
            "configuration": {
                //"simulated": true,
                "ipAddress": "192.168.0.108",
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