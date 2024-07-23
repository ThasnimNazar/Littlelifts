"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const parentSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneno: {
        type: Number,
        required: true,
    },
    selectedchildcategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Childcategory',
        required: true,
    },
    profileImage: {
        type: String
    },
    blocked: {
        type: Boolean,
        default: false
    },
});
const Parent = (0, mongoose_1.model)('Parent', parentSchema);
exports.default = Parent;
