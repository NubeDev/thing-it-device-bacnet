/*
BACnet Object_Type keys

*/

const BACNET_OBJECT_TYPES = {
    AnalogInput: 0,
    AnalogOutput: 1,
    AnalogValue: 2,
    BinaryInput: 3,
    BinaryOutput: 4,
    BinaryValue: 5,
    Calendar: 6,
    Command: 7,
    Device: 8,
    EventEnrollment: 9,
    File: 10,
    Group: 11,
    Loop: 12,
    MultiStateInput: 13,
    MultiStateOutput: 14,
    NotificationClass: 15,
    Program: 16,
    Schedule: 17
};

const bacnet = require('node-bacnet-master')
const r = bacnet.init({
  datalink: {
    iface: 'bridge100',
    ip_port: 0xBAC0
    //bbmd_address: '192.168.0.108'
  },
  device: false
})

function objectIdToString (objectId) {
  return bacnet.objectTypeToString(objectId.type) + '/' + objectId.instance
}

r.on('iam', function (iam) {
  console.log('iam: ', iam)


  //reading the current value
  //r.readProperty(Number deviceId,Number objectTypeKey,Number objectId,String propertyName, Number arrayIndex)
  //r.readProperty(iam.deviceId, 2, 70, 'present-value')
  //writing a value
  //r.writeProperty(Number deviceId,Number objectTypeKey,Number objectId,String propertyName, Number arrayIndex,[String, Number, Array] value)
  //r.writeProperty(iam.deviceId, 2, 69, 'present-value', null, 22.13)
})

r.on('read-property-ack', function (property) {
  //console.log('Received property /', objectIdToString(property.object), '/', property.property)
  //console.log(property.value.map(objectIdToString))
  console.log(property)
  console.log(property.value[0])
})

//asks who is in the whole network
//r.whois()

//only asks this ip address who is
//r.whois('192.168.0.108')

r.readProperty('192.168.0.108', 2, 70, 'present-value')

setTimeout(function () {}, 1000)

//r.closeQueue();
