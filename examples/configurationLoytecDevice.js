module.exports = {
    "label": "Default",
    "id": "default",
    "autoDiscoveryDeviceTypes": [],
    "devices": [
        {
            "plugin": "bacnet/bacNetDevice",
            "actors": [],
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