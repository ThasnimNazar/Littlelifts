"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateSitterToken = (res, sitterId) => {
    console.log('sitterId = ', sitterId);
    const jwtSitterSecret = process.env.JWT_SITTER_SECRET;
    if (!jwtSitterSecret) {
        throw new Error('JWT_SITTER_SECRET is not defined in the environment variables.');
    }
    const token = jsonwebtoken_1.default.sign({ id: sitterId.toString() }, jwtSitterSecret, {
        expiresIn: '30d'
    });
    console.log(token, 'll');
    res.cookie('sitterjwt', token, {
        httpOnly: true, // save the token in httpOnly
        secure: process.env.NODE_ENV === 'development',
        sameSite: 'strict', //to prevent csrf attack
        maxAge: 30 * 24 * 60 * 60 * 1000
    });
};
exports.default = generateSitterToken;
