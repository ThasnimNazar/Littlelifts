"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const sitterotpSchema = new mongoose_1.Schema({
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});
const sitterOtp = (0, mongoose_1.model)('sitterOtp', sitterotpSchema);
exports.default = sitterOtp;
