const BACNET_DEFAULT_PORT = 47808;

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
    Schedule: 17,
    Averaging: 18,
    MultiStateValue: 19,
    TrendLog: 20,
    LifeSafetyPoint: 21,
    LifeSafetyZone: 22
};

const BACNET_PROPERTY_KEYS = {
    apduSegmentTimeout: 10,
    apduTimeout: 11,
    applicationSoftwareVersion: 12,
    changeOfStateCount: 15,
    changeOfStateTime: 16,
    covIncrement: 22,
    description: 28,
    deviceAddressBinding: 30,
    elapsedActiveTime: 33,
    eventState: 36,
    firmwareRevision: 44,
    localDate: 56,
    localTime: 57,
    maxApduLengthAccepted: 62,
    maxInfoFrames: 63,
    maxMaster: 64,
    maxPresValue: 65,
    minimumOffTime: 66,
    minimumOnTime: 67,
    minPresValue: 69,
    modelName: 70,
    numberOfApduRetries: 73,
    numberOfStates: 74,
    objectIdentifier: 75,
    objectList: 76,
    objectName: 77,
    objectType: 79,
    outOfService: 81,
    polarity: 84,
    presentValue: 85,
    priorityArray: 87,
    protocolObjectTypesSupported: 96,
    protocolServicesSupported: 97,
    protocolVersion: 98,
    reliability: 103,
    relinquishDefault: 104,
    segmentationSupported: 107,
    stateText: 110,
    statusFlags: 111,
    systemStatus: 112,
    vendorIdentifier: 120,
    vendorName: 121,
    timeOfActiveTimeReset: 114,
    timeOfStateCountReset: 115,
    units: 117,
    protocolRevision: 139,
    databaseRevision: 155,
};

const BACNET_DATA_TYPES = {
    unsignedInt: 2,
    real: 4,
    bitString: 8,
    enumerated: 9
};

const BACNET_PRIORITIES = {
    low: 16
};

const BACNET_SERVICES = {
    iAm: 0,
    unconfirmedSubscribeCOVNotification: 2,
    subscribeCOV: 5,
    whoIs: 8,
    readProperty: 12,
    writeProperty: 15
};

var self = null;

module.exports = {
    create: function () {
        if (!self) {
            self = new BACnetAdapter();
        }

        return self;
    },

    BACNET_DEFAULT_PORT: BACNET_DEFAULT_PORT,
    BACNET_OBJECT_TYPES: BACNET_OBJECT_TYPES,
    BACNET_PROPERTY_KEYS: BACNET_PROPERTY_KEYS,
    BACNET_DATA_TYPES: BACNET_DATA_TYPES,
    BACNET_SERVICES: BACNET_SERVICES,

    createDevice: function (id, ip, port) {
        return new Device(id, ip, port);
    }

};


const BACNET_ERROR_CLASS_OBJECT_ERROR_CODES = {
    other: 0,
    authenticationFailed: 1,
    configurationInProgress: 2,
    deviceBusy: 3,
    dynamicCreationNotSupported: 4,
    fileAccessDenied: 5,
    incompatibleSecurityLevels: 6,
    inconsistentParameters: 7,
    inconsistentSelectionCriterion: 8,
    invalidDataType: 9,
    invalidFileAccessMethod: 10,
    invalidFileStartPosition: 11,
    invalidOperatorName: 12,
    invalidParameterDataType: 13,
    invalidTimeStamp: 14,
    keyGenerationError: 15,
    missingRequiredParameter: 16,
    noObjectsOfSpecifiedType: 17,
    noSpaceForObject: 18,
    noSpaceToAddListElement: 19,
    noSpaceToWriteProperty: 20,
    noVtSessionsAvailable: 21,
    propertyIsNotAList: 22,
    objectDeletionNotPermitted: 23,
    objectIdentifierAlreadyExists: 24,
    operationalProblem: 25,
    passwordFailure: 26,
    readAccessDenied: 27,
    securityNotSupported: 28,
    serviceRequestDenied: 29,
    timeout: 30,
    unknownObject: 31,
    unknownProperty: 32,
    unknownVtClass: 34,
    unknownVtSession: 35,
    unsupportedObjectType: 36,
    valueOutOfRange: 37,
    vtSessionAlreadyClosed: 38,
    vtSessionTerminationFailure: 39,
    writeAccessDenied: 40,
    characterSetNotSupported: 41,
    invalidArrayIndex: 42,
    invalidIndex: 42,
};

const BACNET_ERROR_CLASS_OBJECT_ERROR_MESSAGES = [
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.other, message: 'Other'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.authenticationFailed, message: 'Authentication failed'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.configurationInProgress, message: 'Configuration in progress'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.deviceBusy, message: 'Device busy'},
    {
        code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.dynamicCreationNotSupported,
        message: 'Dynamic creation not supported'
    },
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.fileAccessDenied, message: 'File access denied'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.incompatibleSecurityLevels, message: 'Incompatible security levels'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.inconsistentParameters, message: 'Inconsistent parameters'},
    {
        code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.inconsistentSelectionCriterion,
        message: 'Inconsistent selection criterion'
    },
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.invalidDataType, message: 'Invalid data type'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.invalidFileAccessMethod, message: 'Invalid file access method'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.invalidFileStartPosition, message: 'Invalid file start position'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.invalidOperatorName, message: 'Invalid operator name'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.invalidParameterDataType, message: 'Invalid parameter data type'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.invalidTimeStamp, message: 'Invalid time stamp'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.keyGenerationError, message: 'Key generation error'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.missingRequiredParameter, message: 'Missing required parameter'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.noObjectsOfSpecifiedType, message: 'No objects of specified type'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.noSpaceForObject, message: 'No space for object'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.noSpaceToAddListElement, message: 'No space to add list element'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.noSpaceToWriteProperty, message: 'No space to write property'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.noVtSessionsAvailable, message: 'No vt sessions available'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.propertyIsNotAList, message: 'Property is not a list'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.objectDeletionNotPermitted, message: 'Object deletion not permitted'},
    {
        code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.objectIdentifierAlreadyExists,
        message: 'Object identifier already exists'
    },
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.operationalProblem, message: 'Operational problem'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.passwordFailure, message: 'Password failure'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.readAccessDenied, message: 'Read access denied'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.securityNotSupported, message: 'Security not supported'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.serviceRequestDenied, message: 'Service request denied'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.timeout, message: 'Timeout'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.unknownObject, message: 'Unknown object'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.unknownProperty, message: 'Unknown property'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.unknownVtClass, message: 'Unknown vt class'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.unknownVtSession, message: 'Unknown vt session'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.unsupportedObjectType, message: 'Unsupported object type'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.valueOutOfRange, message: 'Value out of range'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.vtSessionAlreadyClosed, message: 'Vt session already closed'},
    {
        code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.vtSessionTerminationFailure,
        message: 'Vt session termination failure'
    },
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.writeAccessDenied, message: 'Write access denied'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.characterSetNotSupported, message: 'Character set not supported'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.invalidArrayIndex, message: 'Invalid array index'},
    {code: BACNET_ERROR_CLASS_OBJECT_ERROR_CODES.invalidIndex, message: 'Invalid index'}
];


var dgram = require('dgram');
var q = require('q');
var _ = require('underscore');

/**
 *
 * @constructor
 */
function BACnetAdapter() {
};

/**
 * @param host
 * @param port
 */
BACnetAdapter.prototype.initialize = function (device) {
    var deferred = q.defer();

    if ((!device) || (!device.id) || (!device.ip) || (!device.port)) {
        deferred.reject(new Error('Device object needed for initialization.'))
    } else {
        console.log('DEBUG bacNetAdapter: (' + device.id + ') Initializing.');

        if (!this.adapterPort) {
            this.adapterPort = device.port;
            this.initializing = true;
            this.consumers = {};
            this.consumers[device.port] = 0;

            this.bms = new BACnetMessageService();
            this.invokeIdService = new IdManagementService();

            this.requests = [];
            this.listeners = [];

            this.TIMEOUT = 5000;

            this.udpClient = dgram.createSocket('udp4');

            this.udpClient.on('listening', function () {
                var address = this.udpClient.address();
                console.log('DEBUG bacNetAdapter: UDP Server listening on ' + address.address + ":" + address.port);
                this.confirmViaWhoIs(device)
                    .then(function (device) {
                        this.initializing = false;
                        deferred.resolve(device);
                    }.bind(this));
            }.bind(this));

            this.udpClient.on('message', function (message, remote) {
                this.handleMessage(message, remote);
            }.bind(this));

            this.udpClient.bind(this.adapterPort);
        } else if (this.initializing) {
            console.log('DEBUG bacNetAdapter: (' + device.id + ') Initializing another device, waiting 1s.');

            setTimeout(function () {
                if (this.initializing) {
                    console.log('DEBUG bacNetAdapter: (' + device.id + ') Initializing another device, waiting 1s.');

                    setTimeout(function () {
                        if (this.initializing) {
                            console.log('DEBUG bacNetAdapter: (' + device.id + ') Initializing another device, waiting 1s.');

                            setTimeout(function () {
                                if (this.initializing) {
                                    deferred.reject(new Error('Adapter is currently initializing another device.'));
                                } else {
                                    console.log('DEBUG bacNetAdapter: (' + device.id + ') wait resolved.');
                                    deferred.resolve(this.confirmViaWhoIs(device));
                                }
                            }.bind(this), 1000);
                        } else {
                            console.log('DEBUG bacNetAdapter: (' + device.id + ') wait resolved.');
                            deferred.resolve(this.confirmViaWhoIs(device));
                        }
                    }.bind(this), 1000);
                } else {
                    console.log('DEBUG bacNetAdapter: (' + device.id + ') wait resolved.');
                    deferred.resolve(this.confirmViaWhoIs(device));
                }
            }.bind(this), 1000);
        } else if (this.adapterPort == device.port) {
            this.consumers[this.adapterPort]++;
            deferred.resolve(this.confirmViaWhoIs(device));
        }
        else {
            //TODO allow for more than one port and create multiple UDP listeners.
            deferred.reject(new Error('This BACnet adapter instance operates on port ' + this.adapterPort
                + ' and initialization was requested against port ' + devicePort
                + '. Multiple ports are currently not supported. Please use the same port or operate a separate gateway'))
        }
    }
    return deferred.promise;
};

BACnetAdapter.prototype.confirmViaWhoIs = function (device) {
    var deferred = q.defer();

    this.whoIs(device)
        .then(function (result) {
            console.log('DEBUG bacNetAdapter: (' + device.id + ') WhoIs received - destinationNetwork '
                + result.destinationNetworkAddress + ', objectId ' + result.objectId + ', objectType: ' + result.objectType);
            device.bmsConfig = result;
            this.consumers[device.port]++;
            console.log('DEBUG bacNetAdapter: (' + device.id + ') Initialize complete. Consumer count: '
                + this.consumers[device.port]);
            deferred.resolve(device);
        }.bind(this))
        .fail(function (result) {
            console.log('DEBUG bacNetAdapter: (' + device.id + ') Error during WhoIs: ' + result);
            deferred.reject();
        }.bind(this));

    return deferred.promise;
}

BACnetAdapter.prototype.release = function (device) {
    var deferred = q.defer();

    this.consumers[device.port]--;

    if (this.consumers[device.port] < 1) {
        this.stop();
    }

    deferred.resolve();
    return deferred.promise;
};


BACnetAdapter.prototype.stop = function () {
    console.log('DEBUG bacNetAdapter: adapter stop');
    this.udpClient.close();
    this.adapterPort = null;
    this.initializing = false;
};

BACnetAdapter.prototype.handleMessage = function (message, remote) {
    var messageJSON = this.bms.messageToJSON(message);
    //console.log('DEBUG bacNetAdapter: handling message with service choice ' + messageJSON.serviceChoice + '.');
    //console.log(messageJSON);

    if (messageJSON.serviceChoice == BACNET_SERVICES.readProperty
        || messageJSON.serviceChoice == BACNET_SERVICES.writeProperty
        || messageJSON.serviceChoice == BACNET_SERVICES.subscribeCOV) {
        //matching back request
        //console.log('DEBUG bacNetAdapter: try matching request for invokeId "' + messageJSON.invokeId + '"');
        var matchingRequest = _.find(this.requests, {
            invokeId: messageJSON.invokeId,
            serviceChoice: messageJSON.serviceChoice
        });

        if (matchingRequest) {
            // console.log('DEBUG bacNetAdapter: found request for invokeId "' + messageJSON.invokeId
            //     + '" with service choice ' + messageJSON.serviceChoice + '.');
            this.invokeIdService.returnId(matchingRequest.invokeId);

            if (!messageJSON.error) {
                if (messageJSON.serviceChoice == BACNET_SERVICES.subscribeCOV) {
                    if (matchingRequest.isSubscribed) {
                        if (matchingRequest.listener) {
                            //TODO for Priva, this happens after a value change has already been sent. Need to figure out if
                            //TODO registration for listeners should occur earlier.
                            matchingRequest.listener.register();
                        }
                    } else {
                        if (matchingRequest.listener) {
                            matchingRequest.listener.unregister();
                        }
                    }
                }

                if (messageJSON.serviceChoice == BACNET_SERVICES.readProperty) {
                    matchingRequest.params.propertyValue = messageJSON.propertyValue;
                    matchingRequest.params.propertyString = messageJSON.propertyIdString;
                }

                matchingRequest.resolve(matchingRequest.params);
            } else {
                var error = BACNET_ERROR_CLASS_OBJECT_ERROR_MESSAGES.find(function (item) {
                    if (messageJSON.errorCode == item.code) {
                        return item;
                    }
                });

                matchingRequest.reject('BACnet error "' + error.message + '" (code ' + error.code + ') returned.');
            }
        } else {
            console.log('DEBUG bacNetAdapter: could not find request for invokeId "' + +'" with service choice ' + messageJSON.serviceChoice + '.');
        }
    } else if (messageJSON.serviceChoice == BACNET_SERVICES.unconfirmedSubscribeCOVNotification) {
        //matching back listener
        console.log('DEBUG bacNetAdapter: (' + remote.address + ':' + remote.port + ') try matching notification with value "'
            + messageJSON.propertyValue
            + '" for objectId ' + messageJSON.objectId + ' property ' + messageJSON.propertyId + ' with service choice '
            + messageJSON.serviceChoice + '.');
        var matchingListener = _.find(this.listeners, {
            objectType: messageJSON.objectType,
            objectId: messageJSON.objectId
        });

        if (matchingListener) {
            console.log('DEBUG bacNetAdapter: (' + remote.address + ':' + remote.port + ') matched notification with value "'
                + messageJSON.propertyValue + '" for objectId ' + messageJSON.objectId + ', property ' + messageJSON.propertyId);
            matchingListener.callback(messageJSON);
        } else {
            console.log('DEBUG bacNetAdapter: no match for notification with value "' + messageJSON.propertyValue
                + '" for objectId ' + messageJSON.objectId + ' property ' + messageJSON.propertyId);
        }
    } else if (messageJSON.serviceChoice == BACNET_SERVICES.iAm) {
        //console.log('DEBUG bacNetAdapter: (' + remote.address + ':' + remote.port + ') Got i am.');
        var matchingRequest = _.find(this.requests, {serviceChoice: BACNET_SERVICES.whoIs});

        if (matchingRequest) {
            console.log('DEBUG bacNetAdapter: (' + remote.address + ':' + remote.port + ') Found request');
            matchingRequest.resolve(messageJSON);
        }
    } else if (messageJSON.serviceChoice == BACNET_SERVICES.whoIs) {
        //console.log('DEBUG bacNetAdapter: Received WhoIs message from ' + remote.address + ':' + remote.port);
    } else {
        //TODO add error handling - currently errors land here as they have no service choice
        console.log('DEBUG bacNetAdapter: (' + remote.address + ':' + remote.port + ') Service choice '
            + messageJSON.serviceChoice + ' from ' + remote.address + ':' + remote.port + ' not supported');
    }

};

/**
 * Generic request send
 *
 * @param request
 * @returns {*}
 */
BACnetAdapter.prototype.sendRequest = function (request, callback) {
    console.log('DEBUG bacNetAdapter: (' + request.device.id + ') adapter send request');
    var deferred = q.defer();
    var address = request.device.ip;
    request.deferred = deferred;
    request.adapter = this;

    this.requests.push(request);

    //this option is needed for whoIs broadcast messages
    if (request.serviceChoice == BACNET_SERVICES.whoIs) {
        var address = '255.255.255.255';
        this.udpClient.setBroadcast(true);
    }

    this.udpClient.send(request.message, 0, request.message.length, request.device.port, address, function (err, bytes) {
        if (err) {
            this.requests = _.without(this.requests, request);
            throw err;
        }

        console.log('DEBUG bacNetAdapter: (' + request.device.id + ') UDP client message sent.');

        if (request.serviceChoice == BACNET_SERVICES.whoIs) {
            this.udpClient.setBroadcast(false);
        }

        request.startWaiting(this.TIMEOUT);
    }.bind(this));

    return deferred.promise;
};

BACnetAdapter.prototype.whoIs = function (device) {
    console.log('DEBUG bacNetAdapter: (' + device.id + ') Sending WhoIs via UDP broadcast.');
    var message = this.bms.newWhoIsMessage();

    var request = new Request();
    request.serviceChoice = BACNET_SERVICES.whoIs;
    request.message = message;
    request.device = device;

    return this.sendRequest(request);
};

BACnetAdapter.prototype.readProperty = function (objectTypeString, objectId, propertyIdString, device) {
    var promise;

    if (device) {
        console.log('DEBUG bacNetAdapter: (' + device.id + ') adapter - read property');
        var params = {
            objectType: objectTypeString,
            objectId: objectId,
            propertyId: propertyIdString
        };

        var invokeId = this.invokeIdService.getId();
        var objectType = BACNET_OBJECT_TYPES[objectTypeString];
        var propertyId = BACNET_PROPERTY_KEYS[propertyIdString];
        var bmsConfig = device.bmsConfig;
        var message = this.bms.newReadPropertyMessage(invokeId, objectType, objectId, propertyId, bmsConfig);

        var request = new Request();
        request.invokeId = invokeId;
        request.serviceChoice = BACNET_SERVICES.readProperty;
        request.params = params;
        request.message = message;
        request.device = device;

        promise = this.sendRequest(request);
    } else {
        promise = q.fcall(function () {
            throw new Error("Could not read for unknown device. Ensure device returned by initialize was provided");
        })
    }

    return promise;
};

BACnetAdapter.prototype.readPropertyById = function (objectTypeString, objectId, propertyId, device) {
    var promise;

    if (device) {
        console.log('DEBUG bacNetAdapter: (' + device.id + ') adapter - read property');
        var params = {
            objectType: objectTypeString,
            objectId: objectId,
            propertyId: propertyId
        };

        var invokeId = this.invokeIdService.getId();
        var objectType = BACNET_OBJECT_TYPES[objectTypeString];
        var bmsConfig = device.bmsConfig;
        var message = this.bms.newReadPropertyMessage(invokeId, objectType, objectId, propertyId, bmsConfig);

        var request = new Request();
        request.invokeId = invokeId;
        request.serviceChoice = BACNET_SERVICES.readProperty;
        request.params = params;
        request.message = message;
        request.device = device;

        promise = this.sendRequest(request);
    } else {
        promise = q.fcall(function () {
            throw new Error("Could not read for unknown device. Ensure device returned by initialize was provided");
        })
    }

    return promise;
};

BACnetAdapter.prototype.writeProperty = function (objectTypeString, objectId, propertyIdString, propertyValue, device) {
    var promise;

    if (device) {
        console.log('DEBUG bacNetAdapter: (' + device.id + ') adapter - write property');

        var params = {
            objectType: objectTypeString,
            objectId: objectId,
            propertyId: propertyIdString,
            propertyValue: propertyValue
        };

        var invokeId = this.invokeIdService.getId();
        var objectType = BACNET_OBJECT_TYPES[objectTypeString];
        var propertyId = BACNET_PROPERTY_KEYS[propertyIdString];
        var bmsConfig = device.bmsConfig;
        var message = this.bms.newWritePropertyMessage(invokeId, objectType, objectId, propertyId, propertyValue);

        var request = new Request();
        request.invokeId = invokeId;
        request.serviceChoice = BACNET_SERVICES.writeProperty;
        request.params = params;
        request.message = message;
        request.device = device;

        promise = this.sendRequest(request);
    } else {
        promise = q.fcall(function () {
            throw new Error("Could not read for unknown device. Ensure device returned by initialize was provided");
        })
    }

    return promise;
};

BACnetAdapter.prototype.subscribeCOV = function (objectTypeString, objectId, device, callback) {
    var promise;

    if (device) {
        console.log('DEBUG bacNetAdapter: (' + device.id + ') adapter subscribe to change of value');

        var params = {
            objectType: objectTypeString,
            objectId: objectId
        };

        var invokeId = this.invokeIdService.getId();
        var objectType = BACNET_OBJECT_TYPES[objectTypeString];
        var bmsConfig = device.bmsConfig;

        //TODO: see if i need a managmend for processIds or if i can just filter the notifications by objectType and objectId
        var message = this.bms.newSubscribeCOVMessage(invokeId, objectType, objectId, 1, 0, 0);

        var listener = new Listener();
        listener.adapter = this;
        listener.objectType = objectType;
        listener.objectId = parseInt(objectId);
        listener.device = device;
        listener.callback = callback;

        var request = new Request();
        request.invokeId = invokeId;
        request.serviceChoice = BACNET_SERVICES.subscribeCOV;
        request.isSubscribed = true;
        request.params = params;
        request.message = message;
        request.listener = listener;
        request.device = device;

        promise = this.sendRequest(request);
    } else {
        promise = q.fcall(function () {
            throw new Error("Could not read for unknown device. Ensure device returned by initialize was provided");
        })
    }

    return promise;
};

BACnetAdapter.prototype.unsubscribeCOV = function (objectTypeString, objectId, device) {
    var promise;

    if (device) {
        console.log('DEBUG bacNetAdapter: (' + device.id + ') adapter unsubscribe to change of value');
        var params = {
            objectType: objectTypeString,
            objectId: objectId
        };

        var invokeId = this.invokeIdService.getId();
        var objectType = BACNET_OBJECT_TYPES[objectTypeString];
        //TODO: see if i need a managmend for processIds or if i can just filter the notifications by objectType and objectId
        var message = this.bms.newSubscribeCOVMessage(invokeId, objectType, objectId, 1);
        var matchingListener = _.find(this.listeners, {objectType: objectType, objectId: objectId});

        var request = new Request();
        request.invokeId = invokeId;
        request.serviceChoice = BACNET_SERVICES.subscribeCOV;
        request.isSubscribed = false;
        request.params = params;
        request.message = message;
        request.device = device;

        if (matchingListener) {
            request.listener = matchingListener;
        }

        promise = this.sendRequest(request);
    } else {
        promise = q.fcall(function () {
            throw new Error("Could not read for unknown device. Ensure device returned by initialize was provided");
        })
    }

    return promise;
};

function Request() {
    this.time = (new Date()).getTime();
}

Request.prototype.startWaiting = function (timeout) {
    console.log('DEBUG bacNetAdapter: (' + this.device.id + ') request start waiting');

    //add timeout
    this.timeout = setTimeout(function () {
        //Remove request
        this.adapter.requests = _.without(this.adapter.requests, this);
        this.deferred.reject('Request timed out after ' + timeout + ' milliseconds.');
    }.bind(this), timeout);
};

Request.prototype.resolve = function (message) {
    console.log('DEBUG bacNetAdapter: (' + this.device.id + ') request resolve');
    clearTimeout(this.timeout);
    this.adapter.requests = _.without(this.adapter.requests, this);

    if (this.callback) {
        this.callback();
    }

    this.deferred.resolve(message);
};

Request.prototype.reject = function (message) {
    console.log('DEBUG bacNetAdapter: (' + this.device.id + ') request reject "' + message + '"');
    clearTimeout(this.timeout);
    this.adapter.requests = _.without(this.adapter.requests, this);
    this.deferred.reject(message);
};

function Listener() {
    this.time = (new Date()).getTime();
}

Listener.prototype.register = function () {
    console.log('DEBUG bacNetAdapter: (' + this.device.id + ') add listener to listeners for object ' + this.objectId + '. ');
    this.adapter.listeners.push(this);
};

Listener.prototype.unregister = function () {
    console.log('DEBUG bacNetAdapter: (' + this.device.id + ') remove listener to listeners for object ' + this.objectId + '. ');
    this.adapter.listeners = _.without(this.adapter.listeners, this);
};

function IdManagementService() {
    this.max = 0xFF;
    this.activeIds = [];
};

IdManagementService.prototype.getId = function () {
    for (var i = 1; i < this.max; i++) {
        if (!_.contains(this.activeIds, i)) {
            this.activeIds.push(i);
            return i;
        }
    }
};

IdManagementService.prototype.returnId = function (id) {
    this.activeIds = _.without(this.activeIds, id);
};

function BACnetMessageService() {
    this.bvlc = new BVLC();
    this.npdu = new NPDU();
    this.apdu = new APDU();
};

BACnetMessageService.prototype.newWhoIsMessage = function () {
    var serviceChoice = BACNET_SERVICES.whoIs; // this is the number for service read property
    var destinationNetworkAddress = 0xffff;
    var destinationMACLayoutAddressLength = 0;

    var buffer = Buffer.alloc(50);
    var offset = new Offset(4);

    this.npdu.write(buffer, offset, 0, 0, 1, 0, 0, 0, 0, 0, destinationNetworkAddress, destinationMACLayoutAddressLength);
    this.apdu.write(buffer, offset, serviceChoice);
    this.bvlc.write(buffer, offset, true);

    //shorten buffer to correct length and return
    return buffer.slice(0, offset.get());
};

BACnetMessageService.prototype.newReadPropertyMessage = function (invokeId, objectType, objectId, property, bmsConfig) {
    var serviceChoice = BACNET_SERVICES.readProperty;
    var buffer = Buffer.alloc(50);
    var offset = new Offset(4);

    if (bmsConfig != undefined) {
        if ((bmsConfig.sourceNetworkAddress != undefined) && (bmsConfig.sourceMacLayerAddressLength != undefined)) {
            this.npdu.write(buffer, offset, 0, 0, 1, 0, 0, 1, 0, 0, bmsConfig.sourceNetworkAddress, bmsConfig.sourceMacLayerAddressLength, bmsConfig.sadr);
        } else {
            this.npdu.write(buffer, offset, 0, 0, 0, 0, 0, 1, 0, 0);
        }
    } else {
        this.npdu.write(buffer, offset, 0, 0, 0, 0, 0, 1, 0, 0);
    }

    this.apdu.write(buffer, offset, serviceChoice, invokeId);
    this.apdu.writeObject(buffer, offset, 0, objectType, objectId);
    this.apdu.writeProperty(buffer, offset, 1, property);
    this.bvlc.write(buffer, offset, false);

    return buffer.slice(0, offset.get());
};

BACnetMessageService.prototype.newWritePropertyMessage = function (invokeId, objectType, objectId, property, propertyValue, dataTypeExtra) {
    var serviceChoice = BACNET_SERVICES.writeProperty;
    //TODO: see if in some cases another priority is needed
    var priority = 16;
    var dataType;

    if (objectType == BACNET_OBJECT_TYPES.AnalogValue) {
        dataType = BACNET_DATA_TYPES.real;
    } else if (objectType == BACNET_OBJECT_TYPES.BinaryValue) {
        dataType = BACNET_DATA_TYPES.enumerated;
    } else if (objectType == BACNET_OBJECT_TYPES.MultiStateValue) {
        dataType = BACNET_DATA_TYPES.unsignedInt;
    }

    if (dataTypeExtra != undefined) {
        dataType = dataTypeExtra
    }

    var buffer = Buffer.alloc(50);
    var offset = new Offset(4);

    if (this.config != undefined) {
        if ((this.config.sourceNetworkAddress != undefined) && (this.config.sourceMacLayerAddressLength != undefined)) {
            this.npdu.write(buffer, offset, 0, 0, 1, 0, 0, 1, 0, 0, this.config.sourceNetworkAddress, this.config.sourceMacLayerAddressLength, this.config.sadr);
        } else {
            this.npdu.write(buffer, offset, 0, 0, 0, 0, 0, 1, 0, 0);
        }
    } else {
        this.npdu.write(buffer, offset, 0, 0, 0, 0, 0, 1, 0, 0);
    }

    this.apdu.write(buffer, offset, serviceChoice, invokeId);
    this.apdu.writeObject(buffer, offset, 0, objectType, objectId);
    this.apdu.writeProperty(buffer, offset, 1, property);
    this.apdu.writeValue(buffer, offset, 3, dataType, propertyValue);
    this.apdu.writeTaggedParameter(buffer, offset, 4, priority);
    this.bvlc.write(buffer, offset, false);

    return buffer.slice(0, offset.get());
};

BACnetMessageService.prototype.newSubscribeCOVMessage = function (invokeId, objectType, objectId, processId, isConfirmed, lifeTime) {
    var serviceChoice = BACNET_SERVICES.subscribeCOV; // this is the number for service subscribeCOV
    var buffer = Buffer.alloc(50);
    var offset = new Offset(4);

    if (this.config != undefined) {
        if ((this.config.sourceNetworkAddress != undefined) && (this.config.sourceMacLayerAddressLength != undefined)) {
            this.npdu.write(buffer, offset, 0, 0, 1, 0, 0, 1, 0, 0, this.config.sourceNetworkAddress, this.config.sourceMacLayerAddressLength, this.config.sadr);
        } else {
            this.npdu.write(buffer, offset, 0, 0, 0, 0, 0, 1, 0, 0);
        }
    } else {
        this.npdu.write(buffer, offset, 0, 0, 0, 0, 0, 1, 0, 0);
    }

    this.apdu.write(buffer, offset, serviceChoice, invokeId);
    this.apdu.writeTaggedParameter(buffer, offset, 0, processId);
    this.apdu.writeObject(buffer, offset, 1, objectType, objectId);
    if (isConfirmed != undefined) {
        this.apdu.writeTaggedParameter(buffer, offset, 2, isConfirmed);
    }
    if (lifeTime != undefined) {
        this.apdu.writeTaggedParameter(buffer, offset, 3, lifeTime);
    }
    this.bvlc.write(buffer, offset, false);

    return buffer.slice(0, offset.get());
};

BACnetMessageService.prototype.messageToJSON = function (message) {
    var messageJSON = {};
    var offset = new Offset();

    var bvlcJSON = this.bvlc.read(message, offset);
    //console.log(bvlcJSON);
    var npduJSON = this.npdu.read(message, offset);
    //console.log(npduJSON);
    var apduJSON = this.apdu.read(message, offset);
    //console.log(apduJSON);

    //the following code provides a short version of the most important data
    if (npduJSON.destinationNetworkAddress != undefined) messageJSON.destinationNetworkAddress = npduJSON.destinationNetworkAddress;
    if (npduJSON.destinationMacLayerAddressLength != undefined) messageJSON.destinationMacLayerAddressLength = npduJSON.destinationMacLayerAddressLength;
    if (npduJSON.destinationMacAddress != undefined) messageJSON.destinationMacAddress = npduJSON.destinationMacAddress;
    if (npduJSON.sourceNetworkAddress != undefined) messageJSON.sourceNetworkAddress = npduJSON.sourceNetworkAddress;
    if (npduJSON.sourceMacLayerAddressLength != undefined) messageJSON.sourceMacLayerAddressLength = npduJSON.sourceMacLayerAddressLength;
    if (npduJSON.sadr != undefined) messageJSON.sadr = npduJSON.sadr;
    if (npduJSON.hopCount != undefined) messageJSON.hopCount = npduJSON.hopCount;

    if (apduJSON.invokeId != undefined) messageJSON.invokeId = apduJSON.invokeId;
    messageJSON.serviceChoice = apduJSON.serviceChoice;
    if (apduJSON.processId != undefined) messageJSON.processId = apduJSON.processId.value;
    if (apduJSON.lifeTime != undefined) messageJSON.lifeTime = apduJSON.lifeTime.value;
    if (apduJSON.device != undefined) {
        messageJSON.objectType = apduJSON.device.objectType;
        messageJSON.objectId = apduJSON.device.objectId;
    }
    if (apduJSON.object != undefined) {
        messageJSON.objectType = apduJSON.object.objectType;
        messageJSON.objectId = apduJSON.object.objectId;
    }
    if (apduJSON.property != undefined) {
        messageJSON.propertyId = apduJSON.property.propertyKey;
        messageJSON.propertyIdString = apduJSON.property.propertyString;
    }
    if (apduJSON.propertyValue != undefined) messageJSON.propertyValue = apduJSON.propertyValue.propertyValue;
    if (apduJSON.listOfValues != undefined) {
        messageJSON.propertyId = apduJSON.listOfValues.property.propertyKey;
        messageJSON.propertyValue = apduJSON.listOfValues.propertyValue.propertyValue;
        messageJSON.status = {
            inAlarm: apduJSON.listOfValues.statusFlagsValue.inAlarm,
            fault: apduJSON.listOfValues.statusFlagsValue.fault,
            overridden: apduJSON.listOfValues.statusFlagsValue.overridden,
            outOfService: apduJSON.listOfValues.statusFlagsValue.outOfService
        }
    }
    if (apduJSON.maxAPDUlength != undefined) messageJSON.maxAPDUlength = apduJSON.maxAPDUlength.value;
    if (apduJSON.segmentationSupported != undefined) messageJSON.segmentationSupported = apduJSON.segmentationSupported.value;
    if (apduJSON.vendorId != undefined) messageJSON.vendorId = apduJSON.vendorId.value;
    if (apduJSON.error) {
        messageJSON.error = apduJSON.error;
        messageJSON.errorCode = apduJSON.errorCode;
    }

    return messageJSON;
};

function BVLC() {
};

BVLC.prototype.write = function (buffer, offset, isBroadcast) {
    //1st byte type, is always the same indicating
    //2nd byte function of message, that is unicast (e.g. readProperty) or broadcast (e.g. whoIs)

    var type = 0x81;
    var func = 0x0a;
    if (isBroadcast) {
        func = 0x0b;
    }
    var len = offset.set(0);

    buffer.writeUInt8(type, offset.up());
    buffer.writeUInt8(func, offset.up());
    buffer.writeUInt16BE(len, offset.up());

    offset.set(len);
};

BVLC.prototype.read = function (buffer, offset) {
    var bvlc = {};

    bvlc.type = buffer.readUInt8(offset.up());
    bvlc.func = buffer.readUInt8(offset.up());
    bvlc.length = buffer.readUInt16BE(offset.up(2));

    return bvlc;
};

function NPDU() {
};

NPDU.prototype.write = function (buffer, offset,
                                 noApduMessageType, reserved1, destinationSpecifier, reserved2, sourceSpecifier, expectingReply, priority1, priority2,
                                 destinationNetworkAddress, destinationMACLayoutAddressLength, destinationMacAddress) {
    //1st byte version
    //2nd byte control, which consists of 8 different bits

    var version = 0x01; // Version: 0x01 (ASHRAE 135-1995)
    var control = 0x00;

    control = (noApduMessageType << 7)
        | (reserved1 << 6)
        | (destinationSpecifier << 5)
        | (reserved2 << 4)
        | (sourceSpecifier << 3)
        | (expectingReply << 2)
        | (priority1 << 1)
        | priority2;

    buffer.writeUInt8(version, offset.up());
    buffer.writeUInt8(control, offset.up());

    if (destinationSpecifier == 1) {
        buffer.writeUInt16BE(destinationNetworkAddress, offset.up(2));
        buffer.writeUInt8(destinationMACLayoutAddressLength, offset.up());
        if (destinationMACLayoutAddressLength > 0) {
            buffer.write(destinationMacAddress, offset.up(destinationMACLayoutAddressLength), 'hex');
        }
    }

    if (destinationSpecifier == 1) {
        var hopCount = 255;
        buffer.writeUInt8(hopCount, offset.up());
    }
};

NPDU.prototype.read = function (buffer, offset) {
    var npdu = {};

    npdu.version = buffer.readUInt8(offset.up());

    var control = buffer.readUInt8(offset.up());
    npdu.control = {};
    npdu.control.noApduMessageType = control >> 7;
    npdu.control.reserved1 = (control >> 6) & 0x01;
    npdu.control.destinationSpecifier = (control >> 5) & 0x01;
    npdu.control.reserved2 = (control >> 4) & 0x01;
    npdu.control.sourceSpecifier = (control >> 3) & 0x01;
    npdu.control.expectingReply = (control >> 2) & 0x01;
    npdu.control.priority1 = (control >> 1) & 0x01;
    npdu.control.priority2 = control & 0x01;

    if (npdu.control.destinationSpecifier == 1) {
        npdu.destinationNetworkAddress = buffer.readUInt16BE(offset.up(2));
        npdu.destinationMacLayerAddressLength = buffer.readUInt8(offset.up());
        if (npdu.destinationMacLayerAddressLength > 0) {
            npdu.destinationMacAddress = buffer.toString('hex', offset.up(destinationMacLayerAddressLength), offset.get());
        }
    }

    if (npdu.control.sourceSpecifier == 1) {
        npdu.sourceNetworkAddress = buffer.readUInt16BE(offset.up(2));
        npdu.sourceMacLayerAddressLength = buffer.readUInt8(offset.up());
        if (npdu.sourceMacLayerAddressLength > 0) {
            npdu.sadr = buffer.toString('hex', offset.up(npdu.sourceMacLayerAddressLength), offset.get());
        }
    }

    if (npdu.control.destinationSpecifier == 1) {
        npdu.hopCount = buffer.readUInt8(offset.up());
    }

    return npdu;
};

function APDU() {
};

APDU.prototype.write = function (buffer, offset, serviceChoice, invokeId) {
    //1st byte apdu type & pdu flags
    //2nd byte max response segments accepted & size of maximum adpu accepted
    //3rd byte invokeId
    //4th byte service choice

    var type = 0x0; //0 is confirmed request
    if (serviceChoice == BACNET_SERVICES.whoIs) {
        type = 0x1; //1 is unconfirmed request
    }
    var flags = 0x0; //in here is information about segmentation
    var maxRespSegments = 0x0; //in here is information about segmentation
    var maxSizeADPU = 0x5; //5 means up to 1476 octets are accepted

    buffer.writeUInt8((type << 4) | flags, offset.up());

    if (invokeId != undefined) {
        buffer.writeUInt8((maxRespSegments << 4) | maxSizeADPU, offset.up());
        buffer.writeUInt8(invokeId, offset.up());
    }
    buffer.writeUInt8(serviceChoice, offset.up());
};

APDU.prototype.writeTag = function (buffer, offset, contextTagNumber, tagClass, tagValue) {
    //contextTagNumber has 4 bits, tagClass 1 bit and tagValue 3 bits
    var tagByte = (contextTagNumber << 4) | (tagClass << 3) | tagValue;
    buffer.writeUInt8(tagByte, offset.up());
};

APDU.prototype.writeObject = function (buffer, offset, context, objectType, objectId) {
    //objectType has 10 bits and objectId has 22bits
    var objectBytes = (objectType << 22) | objectId;
    this.writeTag(buffer, offset, context, 1, 4);
    buffer.writeUInt32BE(objectBytes, offset.up(4));
};

APDU.prototype.writeProperty = function (buffer, offset, context, propertyKey) {
    this.writeTag(buffer, offset, context, 1, 1);
    buffer.writeUInt8(propertyKey, offset.up());
};

APDU.prototype.writeValue = function (buffer, offset, context, dataType, propertyValue) {
    //TODO: only dataType 2 (unsigned int), 4 (real/float), 9 (enumerated) are supported by this code
    var len = 1; //lenght 1 byte is sufficient for dataType 2 (unsigned int) and dataType 9 (enumerated)
    if (dataType == 4) {
        len = 4; //dataType 4 is a real/float, which is 4 bytes
    }

    //openTag
    this.writeTag(buffer, offset, context, 1, 6);
    //tag indicating dataType of value
    this.writeTag(buffer, offset, dataType, 0, len);
    //value
    if (dataType == 2) {
        //unsigned int
        buffer.writeUInt8(propertyValue, offset.up(len));
    } else if (dataType == 4) {
        //real/float
        buffer.writeFloatBE(propertyValue, offset.up(len));
    } else if (dataType == 9) {
        //enumerated
        buffer.writeUInt8(propertyValue, offset.up(len));
    } else {
        //unsupported datatype
        buffer.writeUInt8(propertyValue, offset.up(len));
    }
    //closeTag
    this.writeTag(buffer, offset, context, 1, 7);
};

APDU.prototype.writeTaggedParameter = function (buffer, offset, context, param) {
    this.writeTag(buffer, offset, context, 1, 1);
    buffer.writeUInt8(param, offset.up());
};

APDU.prototype.read = function (buffer, offset, result) {
    var apdu = {};
    var firstByte = buffer.readUInt8(offset.up());
    apdu.type = firstByte >> 4;

    if (apdu.type == 1) {
        //UNCONFIRMED REQUEST
        apdu.serviceChoice = buffer.readUInt8(offset.up());
        if (apdu.serviceChoice == 0) {
            //iAm
            //ObjectIdentifier: device, 101
            apdu.device = this.readObject(buffer, offset);
            //Maximum ADPU Length Accepted: (Unsigned) 1476
            apdu.maxAPDUlength = this.readTaggedParameter(buffer, offset, 2);
            //Segmentation Supported:  segmented-both
            apdu.segmentationSupported = this.readTaggedParameter(buffer, offset);
            //Vendor ID: PRIVA BV (105)
            apdu.vendorId = this.readTaggedParameter(buffer, offset);
        } else if (apdu.serviceChoice == 2) {
            //unconfirmedCOVNotification
            apdu.processId = this.readTaggedParameter(buffer, offset);
            apdu.device = this.readObject(buffer, offset);
            apdu.object = this.readObject(buffer, offset);
            apdu.lifeTime = this.readTaggedParameter(buffer, offset);
            apdu.listOfValues = this.readListOfValues(buffer, offset);
        } else if (apdu.serviceChoice == 8) {
            //who is
            //TODO: read content of who is request here
        }
    } else if (apdu.type == 2) {
        //SIMPLE ACK
        apdu.invokeId = buffer.readUInt8(offset.up());
        apdu.serviceChoice = buffer.readUInt8(offset.up());
    } else if (apdu.type == 3) {
        //COMPLEX ACK
        apdu.pduFlags = {};
        apdu.pduFlags.segmentedRequest = (firstByte >> 3) & 0x01;
        apdu.pduFlags.moreSegments = (firstByte >> 2) & 0x01;
        apdu.invokeId = buffer.readUInt8(offset.up());
        apdu.serviceChoice = buffer.readUInt8(offset.up());

        if (apdu.serviceChoice == 12) {
            apdu.object = this.readObject(buffer, offset);
            apdu.property = this.readProperty(buffer, offset);
            apdu.propertyValue = this.readValue(buffer, offset);
        }
    } else if (apdu.type == 5) {
        //Error
        apdu.error = true;
        apdu.invokeId = buffer.readUInt8(offset.up());
        apdu.serviceChoice = buffer.readUInt8(offset.up());
        apdu.errorClassPart1 = buffer.readUInt8(offset.up());
        apdu.errorClassPart2 = buffer.readUInt8(offset.up());
        apdu.errorCodePrelude = buffer.readUInt8(offset.up());
        apdu.errorCode = buffer.readUInt8(offset.up());
    } else {
        console.log('DEBUG APDU: Ignored APDU type ' + apdu.type);
    }

    return apdu;
};

APDU.prototype.readTag = function (buffer, offset) {
    var tag = {};
    var byte = buffer.readUInt8(offset.up());

    // read the first 4 bits of the byte by eliminating the last 4
    tag.tagNumber = byte >> 4;

    // read the 5th bit of the byte by eliminating the last 3 and looking at the last bit of the result
    tag.tagClass = (byte >> 3) & 0x01;

    // read the last three bits
    tag.tagValue = byte & 0x07;

    return tag;
};

APDU.prototype.readObject = function (buffer, offset) {
    var obj = {};
    obj.tag = this.readTag(buffer, offset);
    var bytes = buffer.readUInt32BE(offset.up(4));
    obj.objectType = bytes >> 22;
    obj.objectId = (obj.objectType << 22) ^ bytes;
    return obj;
};

APDU.prototype.readProperty = function (buffer, offset) {
    var property = {};
    property.tag = this.readTag(buffer, offset);
    property.propertyKey = buffer.readUInt8(offset.up());
    property.propertyString = this.idToString(property.propertyKey, BACNET_PROPERTY_KEYS);

    return property;
};

APDU.prototype.readValue = function (buffer, offset) {
    var value = {};
    var openTag = this.readTag(buffer, offset);
    value.tag = this.readTag(buffer, offset);
    value.propertyValue;

    if (value.tag.tagNumber == 1) {
        //boolean
        value.propertyValue = value.tag.tagValue === 1;
    } else if (value.tag.tagNumber == 2) {
        //unsigned int
        value.propertyValue = buffer.readUInt8(offset.up());
    } else if (value.tag.tagNumber == 4) {
        //real/float
        value.propertyValue = buffer.readFloatBE(offset.up(4));
    } else if (value.tag.tagNumber == 7) {
        //character string
        //TODO: Not sure this is reading correctly.

        var nextTag = value.tag;
        var strings = [];

        while (nextTag.tagClass === 0) {
            if (nextTag.tagValue === 1) {
                var encoding = buffer.readUInt8(offset.up());
                strings.push('');
            } else {
                if (nextTag.tagValue === 5) {
                    value.length = buffer.readUInt8(offset.up());
                } else {
                    value.length = nextTag.tagValue;
                }

                var encoding = buffer.readUInt8(offset.up());

                switch (encoding) {
                    case 0:
                        value.encoding = 'utf8';
                        break;
                    default:
                        value.encoding = 'utf8';
                        break;
                }

                strings.push(buffer.toString(value.encoding, offset.up(value.length - 1), offset.get()));
            }

            nextTag = this.readTag(buffer, offset);
        }

        if (strings.length === 1) {
            value.propertyValue = strings[0];
        } else {
            value.propertyValue = strings;
        }

        offset.down();

    }
    else if (value.tag.tagNumber == 8) {
        //bit string
        value.unusedBits = buffer.readUInt8(offset.up());
        var bitString = buffer.readUInt8(offset.up());
        //TODO: look up which exact bit corresponds to which status flag. for now it is in order the first four bits from the left
        value.inAlarm = bitString >> 7;
        value.fault = (bitString >> 6) & 0x01;
        value.overridden = (bitString >> 5) & 0x01;
        value.outOfService = (bitString >> 4) & 0x01;
    } else if (value.tag.tagNumber == 9) {
        //enum/binary
        value.propertyValue = buffer.readUInt8(offset.up());
    } else if (value.tag.tagNumber == 12) {
        //Object Identifier -> 4 bytes and 32 bits long, first 10 bits are the object type, last 22 the Instance Number
        var bits = buffer.readUInt32BE(offset.up(4));

        // remove last 22 instance number bits
        var objectTypeId = bits >> 22;

        //remove first 10 object identifier bits
        var objectId = bits << 10 >> 10;

        value.propertyValue = {objectType: objectTypeId, objectId: objectId};
    } else {
        console.log('DEBUG bacNetAdapter: Unsupported DataType - Please look up which data type corresponds to the following info');
        value.propertyValue = buffer[offset.up()];
        console.log('DEBUG bacNetAdapter: propertyValue - (Needs to be converted) ' + value.propertyValue);
    }

    var closeTag = this.readTag(buffer, offset);
    return value;
}
;

APDU.prototype.idToString = function (id, object) {
    var idString;

    for (var property in object) {
        if (object[property] === id) {
            idString = property;
            break;
        }
    }

    return idString;
};

APDU.prototype.readListOfValues = function (buffer, offset) {
    var listOfValues = {};
    var openTag = this.readTag(buffer, offset);
    listOfValues.property = this.readProperty(buffer, offset);
    listOfValues.propertyValue = this.readValue(buffer, offset);
    listOfValues.statusFlags = this.readProperty(buffer, offset);
    listOfValues.statusFlagsValue = this.readValue(buffer, offset);
    var closeTag = this.readTag(buffer, offset);
    return listOfValues;
};

APDU.prototype.readTaggedParameter = function (buffer, offset, len) {
    var taggedParam = {};
    taggedParam.tag = this.readTag(buffer, offset);
    if (!len) {
        taggedParam.value = buffer.readUInt8(offset.up());
    } else if (len == 2) {
        taggedParam.value = buffer.readUInt16BE(offset.up(2));
    }
    return taggedParam;
};

function Offset(value) {
    this.offset = 0;
    if (value != undefined) {
        this.offset = value;
    }
};

Offset.prototype.get = function (value) {
    return this.offset;
};

Offset.prototype.set = function (value) {
    var prev = new Number(this.offset);
    this.offset = value;
    return prev;
};

Offset.prototype.up = function (diff) {
    if (!diff) {
        diff = 1;
    }

    this.offset = this.offset + diff;
    return this.offset - diff;
};

Offset.prototype.down = function (diff) {
    if (!diff) {
        diff = 1;
    }

    this.offset = this.offset - diff;
    return this.offset + diff;
};

function Device(id, ip, port) {
    this.id = id;
    this.ip = ip;
    this.port = port;
    this.bmsConfig = null;
}

