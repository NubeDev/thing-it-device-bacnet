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
                "ipAddress": "",
                "ipMatchRequired": false,
                "url":"frankschubert.selfhost.eu",
                "urlLookupRequired": true,
                "bacNetId": "12345",
                "deviceId": 12345,
                "deviceIdMatchRequired": true,
                "vendorId": 0,
                "vendorIdMatchRequired": false,
                "omitWhoIsConfirmation": true,
            }
        }],
    "services": [],
    "eventProcessors": [],
    "groups": [],
    "jobs": [],
    "data": []
};