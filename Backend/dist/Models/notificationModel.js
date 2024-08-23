"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    recepientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientType: {
        type: String,
        enum: ['parent', 'sitter'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String,
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
exports.default = Notification;
