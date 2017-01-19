'use strict';

const dgram = require('dgram');

const util = require('bacNetUtil');
var Message = require('message');


function BACnetIPNetwork () {

    const port = "9990"; // should come from configuration
    const multicastaddr = "224.0.0.114"; // should come from configuration
    const BVLC_TYPE = 0x81; // should come from configuration

    var server;

    BACnetIPNetwork.prototype.init = function () {
        server = dgram.createSocket('udp4');

        server.on('error', function (err) {
            console.log('server error:\n' + err.stack);
            server.close();
        });

        server.on('message', function (msg, rinfo) {
            var link = rinfo.address + ':' + rinfo.port;

            console.log('server got: ' + msg + ' from ' + link);

            var queue = new ByteQueue(msg);

            var message = this.readNPDU(queue, link);

            if (message.isNetworkMsg()) {

            }
        });


        server.on('listening', function () {
            var address = server.address();
            console.log('server listening' + server.address + ':' + server.port);
        });

        // could even call without port
        server.bind(port, function () {
            server.addMembership(multicastaddr);
        });

        server.ref();
    };

    BACnetIPNetwork.prototype.readNPDU = function (queue, link) {
        // Networktype        if (util.isBitSet(control,5)) {

        var networkType = queue.readUInt();

        if (networkType != BVLC_TYPE) {
            console.log('ERROR: Protocol id is not BACnet/IP (0x81');
            return;
        }

        var msgFunction = queue.readUInt();
        var length = queue.readInt16();
        if (length != queue.size()) {
            console.log('Length field does not match data: given=' + length + ', expected=' + (queue.size()));
        }

        var msg = null;

        if (msgFunction == 0x0)
        // we don't do BBMD (BACnet Broadcast Management Device)
            ;
        else if (msgFunction == 0x1)
        // Write-Broadcast-Distribution-Table
            ;
        else if (msgFunction == 0x2)
        // Read-Broadcast-Distribution-Table
            ;
        else if (msgFunction == 0x3)
        // Not implemented because this does not send Read-Broadcast-Distribution-Table requests, and so should
        // not receive any responses.
            ;
        else if (msgFunction == 0x4)
        // Forwarded-NPDU.
        // If this was a BBMD, it could forward this message to its local broadcast address, meaning it could
        // receive its own forwards.
            ;
        else if (msgFunction == 0x5)
        // Register-Foreign-Device
            ;
        else if (msgFunction == 0x6)
        // Read-Foreign-Device-Table
            ;
        else if (msgFunction == 0x7)
        // Not implemented because this does not send Read-Foreign-Device-Table requests, and so should
        // not receive any responses.
            ;
        else if (msgFunction == 0x8)
        // Delete-Foreign-Device-Table-Entry
            ;
        else if (msgFunction == 0x9)
        // Distribute-Broadcast-To-Network
            ;
        else if (msgFunction == 0xa)
        // Original-Unicast-NPDU
            msg = this.processNpduData(queue, link);
        else if (msgFunction == 0xb) {
            // Original-Broadcast-NPDU
            // If we were BBMD, we would have to forward to foreign devices and other networks

            // just process locally
            msg = this.processNpduData(queue, link);
        }
        else
            console.log('Unknown BVLC function type: 0x' + util.toHexStr(msgFunction, 2));


        if (msg == null)
            return;
    };

    // NL Protocol Data Unit (NPDU)
    BACnetIPNetwork.prototype.processNDPUData = function (queue, link) {
        var message = this.processNPCI(queue, link);
    };

    // NL Protocol Control Information (NPCI)
    BACnetIPNetwork.prototype.processNPCI = function (queue, link) {
        var version = queue.readUInt();
        var control = queue.readUInt();

        var destinationNetwork = 0;
        var destinationAddress = 0;

        var sourceNetwork = 0;
        var sourceAddress = 0;

        var networkMsgType = null;
        var vendorId = null;

        if (util.isBitSet(control,5)) {
            destinationNetwork = queue.readUInt16();
            var destinationLength = queue.readUInt();

            if (destinationLength > 0) {
                destinationAddress = queue.readBytes(destinationLength);
            }
        }
        if (util.isBitSet(control,3)) {
            sourceNetwork = queue.readUInt16();
            var sourceLength = queue.readUInt();
            sourceAddress = queue.readBytes(sourceLength);
        }
        if (util.isBitSet(control,5)) {
            // do not need to do anything with it since we are no router
            var hopCount = queue.readUInt8();
        }
        if (util.isBitSet(control,7)) {
            // network message
            networkMsgType = queue.readUInt8();

            /******
            If Bit 7 of the Control octet is 1, then this field is present and has one of the following hex values:
                X'00': Who-Is-Router-To-Network
            X'01': I-Am-Router-To-Network
            X'02': I-Could-Be-Router-To-Network
            X'03': Reject-Message-To-Network
            X'04': Router-Busy-To-Network
            X'05': Router-Available-To-Network
            X'06': Initialize-Routing-Table
            X'07': Initialize-Routing-Table-Ack
            X'08': Establish-Connection-To-Network
            X'09': Disconnect-Connection-To-Network
            X'0A': Challenge-Request
            X'0B': Security-Payload
            X'0C': Security-Response
            X'0D': Request-Key-Update
            X'0E': Update-Key-Set
            X'0F': Update-Distribution-Key
            X'10': Request-Master-Key
            X'11': Set-Master-Key
            X'12': What-Is-Network-Number
            X'13': Network-Number-Is
            X'14' to X'7F': Reserundefinedved for use by ASHRAE
            X'80' to X'FF': Available for vendor proprietary messages
             *******/

            if (networkMsgType >= 80)
                vendorId = queue.readUInt16();
        }

        // TODO: check, if message is either addressed to ourselves or a broadcast that we have to consider!!

        var msg = new Message(queue,
            sourceNetwork,
            sourceAddress,
            destinationNetwork,
            destinationAddress,
            networkMsgType,
            vendorId);

        if (util.isBitSet(control,7)) {
            msg.setIsNetworkMsg(true);
        }

        return msg;
    };

    BACnetIPNetwork.prototype.processADPUData = function(msg) {

    };
}


