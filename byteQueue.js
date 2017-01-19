/**
 * Created by backes on 15.01.17.
 */

'use strict'

module.exports = ByteQueue;

function ByteQueue(msgBuffer) {
    this.buffer = msgBuffer;
    this.pos = 0;

    this.dv = new DataView(msgBuffer);

    ByteQueue.prototype.getPos = function () {
        return this.pos;
    };

    ByteQueue.prototype.incPos = function (noOfBytes) {
        this.pos += noOfBytes;
    };

    ByteQueue.prototype.getBuffer = function () {
        return this.buffer;
    };

    ByteQueue.prototype.size = function () {
        return this.buffer.byteLength;
    };

    ByteQueue.prototype.readEnum = function (enumDef) {
        // next byte from queue, queue is actually an Int8-ArrayView on a Buffer
        var data = this.dv.getInt8(pos);

        this.incPos(1);

        // check for valid enumeratiuion value

        for (var enumVal in enumDef.elements) {
            if (data == 0 ||
                data == enumVal) {
                return data;
            }
        }
        // handle error
        console.error("unknown enumeration value: "+data);

        return 0;
    };
    ByteQueue.prototype.readUInt8 = function () {
        var data = this.dv.getUint8(pos);
        this.incPos(1);
        return data;
    };
    ByteQueue.prototype.readInt8 = function () {
        var data = this.dv.getInt8(pos);
        this.incPos(1)
        return data;
    };
    ByteQueue.prototype.readUInt16 = function () {
        var data = this.dv.getInt16(pos);
        this.incPos(2);
        return data;
    };
    ByteQueue.prototype.readInt16 = function () {
        var data = this.dv.getInt16(pos);
        this.incPos(2);
        return data;
    };
    ByteQueue.prototype.readUInt32 = function () {
        var data = this.dv.getUint32(pos);
        this.incPos(4);
        return data;
    };
    ByteQueue.prototype.readInt32 = function () {
        var data = this.dv.getInt32(pos);
        this.incPos(4)
        return data;
    };
    ByteQueue.prototype.readString = function (){
        // get encoding before reading
        // TODO
    };
    ByteQueue.prototype.readBytes = function (len){
        var data = new Uint8Array(this.buffer, this.pos, len);
        this.incPos(len);
        return data;
    };
}