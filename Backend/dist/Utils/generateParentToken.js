"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateParentToken = (res, parentId) => {
    console.log('heyy');
    const token = jsonwebtoken_1.default.sign({ id: parentId }, process.env.JWT_PARENT_SECRET, {
        expiresIn: '30d',
    });
    console.log(token, 'token');
    res.cookie('parentjwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};
exports.default = generateParentToken;
