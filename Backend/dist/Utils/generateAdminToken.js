"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAdmintoken = (res, userId) => {
    console.log('admin');
    const jwtToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET_KEY_ADMIN, { expiresIn: '30d' });
    const cookieOptions = {
        httpOnly: true, // To prevent cookies from being accessed by client-side scripts
        secure: process.env.NODE_ENV !== 'development', // Value will be false in the development environment and hence http will be allowed in development
        sameSite: 'strict', // Sets sameSite to 'strict'
        maxAge: 30 * 24 * 60 * 60 * 1000, // Sets expiry of cookie to 30 days
    };
    res.cookie('adminJwt', jwtToken, cookieOptions);
};
exports.default = generateAdmintoken;
