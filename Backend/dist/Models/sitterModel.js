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
const sitterSchema = new mongoose_1.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    phoneno: {
        type: Number,
        unique: true
    },
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    yearofexperience: {
        type: Number,
    },
    workwithpet: {
        type: String,
        enum: ['yes', 'no']
    },
    activities: [{
            type: String,
            enum: ['Animations', 'Help with homework', 'Montessori', 'Manual activities'],
        }],
    more: [{
            type: String,
            enum: ['Cooking', 'Housework', 'Gardening']
        }],
    maxchildren: {
        type: Number,
    },
    servicepay: {
        type: Number,
    },
    about: {
        type: String,
    },
    childcategory: [{
            type: mongoose_1.default.Types.ObjectId,
            ref: 'Childcategory',
        }],
    selectedSittingOption: {
        type: mongoose_1.default.Types.ObjectId,
        ref: 'Sittingcategory',
        default: null,
    },
    weekendSlots: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'WeekendSitting',
        }],
    occasionalSlots: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'OccasionalSitting',
        }],
    specialCareSlots: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'SpecialCareSitting',
        }],
    verificationDocuments: [{
            type: String
        }],
    profileImage: {
        type: String
    },
    verified: {
        type: Boolean,
        default: false
    },
    blocked: {
        type: Boolean,
        default: false
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }
    }
}, { timestamps: true });
sitterSchema.index({ location: '2dsphere' });
const Sitter = (0, mongoose_1.model)('Sitter', sitterSchema);
exports.default = Sitter;
