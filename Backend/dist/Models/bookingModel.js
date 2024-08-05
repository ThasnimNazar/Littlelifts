"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bookingSchema = new mongoose_1.Schema({
    sitter: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Sitter',
    },
    parent: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Parent',
    },
    servicepay: {
        type: String,
        required: true
    },
    selectedDate: {
        type: Date,
        required: true
    },
    timeSlot: {
        startTime: {
            type: Date,
        },
        endTime: {
            type: Date,
        }
    },
    status: [{
            type: String,
            enum: ['Pending', 'Approved', 'Cancelled'],
            required: true
        }],
    isPaid: {
        type: Boolean,
        required: true
    },
    rejectionReason: {
        type: String,
    },
    chargeId: {
        type: String,
    },
    sessionId: {
        type: String,
    },
    refundAmount: {
        type: Number,
    },
    refundStatus: {
        type: [String],
        enum: ["Pending", "succeeded"],
        default: []
    },
    reviewSubmitted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
const Booking = (0, mongoose_1.model)('Booking', bookingSchema);
exports.default = Booking;
