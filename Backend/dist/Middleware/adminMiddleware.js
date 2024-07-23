"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const adminModel_1 = __importDefault(require("../Models/adminModel"));
const authenticateAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.adminJwt;
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY_ADMIN);
            const user = yield adminModel_1.default.findById(decoded.userId).select('-password');
            console.log(user, 'hyy');
            if (user) {
                req.user = user;
                next();
            }
            else {
                res.status(401).json({ message: 'User not found' });
            }
        }
        catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    }
    else {
        res.status(401).json({ message: 'No token provided' });
    }
}));
exports.default = authenticateAdmin;
