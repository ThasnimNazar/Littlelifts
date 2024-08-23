"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const usersubscriptionSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Parent',
    },
    planId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subscriptionplan',
    },
    startDate: {
        type: Date,
        default: Date.now()
    },
    endDate: {
        type: Date,
        default: Date.now()
    },
    status: [{
            type: String,
            enum: ['Active', 'Inactive', 'Cancelled'],
            required: true
        }],
    credit: {
        type: Number,
    },
    autoRenewal: {
        type: Boolean,
    },
    sessionId: {
        type: String,
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentHistory: [{
            amount: { type: Number, required: true },
            date: { type: Date, required: true },
            method: { type: String, required: true }
        }],
    isPaid: {
        type: Boolean
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
});
const Usersubscription = (0, mongoose_1.model)('Usersubscription', usersubscriptionSchema);
exports.default = Usersubscription;
