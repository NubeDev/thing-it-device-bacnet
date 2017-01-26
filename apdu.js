/**
 * Created by backes on 26.01.17.
 */


'use strict';

module.exports = {};

exports.createAPDU = function (queue) {
    // Get the first byte. The 4 high-order bits will tell us the type of PDU this is.
    var type = msg.queue().readBytes(1,0);
    type = ((type & 0xff) >> 4);

    if (type == 0)
    // ConfirmedRequest
        ;
    if (type == 1)
    // UnconfirmedRequest
        ;
    if (type == 2)
    // SimpleACK
        ;
    if (type == 3)
    // ComplexACK
        ;
    if (type == 4)
    // SegmentACK
        ;
    if (type == 5)
    // Error
        ;
    if (type == 6)
    // Reject
        ;
    if (type == 7)
        return new Abort(queue);
    else
        console.log("Illegal (A)PDU Type: "+type+"!!");

}

function APDU (queue) {
    this.queue = queue;

    this.typeId = -1;

    APDU.prototype.write = function (queue) {
        consol.error('should not be called');
    };

    APDU.prototype.needsReply = function () {
        return false;
    };

    APDU.prototype.getShiftedTypeId = function () {
        return typeId << 4;
    };
}

AckAPDU.prototype = new APDU();
AckAPDU.prototype.constructor = AckAPDU;
AckAPDU.prototype.parent = APDU.prototype;
function AckAPDU (queue) {
    this.parent.queue = queue;

    /**
     * This parameter shall be the 'invokeID' contained in the confirmed service request being acknowledged. The same
     * 'originalinvokeID' shall be used for all segments of a segmented acknowledgment.
     */
    this.originalInvokeId = -1;

    AckAPDU.prototype.getOriginalInvokeId = function () {
        return this.originalInvokeId;
    };

    AckAPDU.prototype.isServer = function () {
        return true;
    };
}

/**
 * The BACnet-Abort-PDU is used to terminate a transaction between two peers.
 *
 */
Abort.prototype = new AckAPDU();
Abort.prototype.constructor = Abort;
Abort.prototype.parent = AckAPDU.prototype;
function Abort (queue) {
    this.parent.parent.typeId = 7;

    /**
     * This parameter shall be TRUE when the Abort PDU is sent by a server. This parameter shall be FALSE when the Abort
     * PDU is sent by a client.
     */
    this.is_server = false;

    /**
     * This parameter, of type BACnetAbortReason, contains the reason the transaction with the indicated invoke ID is
     * being aborted.
     */
    this.abortReason = 0;

    this.is_server = (queue.readUInt8() & 1) == 1;
    this.parent.originalInvokeId = queue.readUInt8();
    this.abortReason = queue.readUInt8();


    Abort.prototype.getPduType = function () {
        return this.TYPE_ID;
    };

    Abort.prototype.isServer = function () {
        return this.is_server;
    };

    Abort.prototype.getAbortReason = function () {
        return this.abortReason;
    };

    Abort.prototype.write = function (queue) {
        var data = getShiftedTypeId(TYPE_ID) | (is_server ? 1 : 0);
        queue.push(data);
        queue.push(originalInvokeId);
        queue.push(abortReason);
    };

    Abort.prototype.expectsReply = function () {
        return false;
    };
}
