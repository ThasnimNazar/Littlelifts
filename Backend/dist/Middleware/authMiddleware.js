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
exports.protectSitter = exports.protectParent = void 0;
const parentModel_1 = __importDefault(require("../Models/parentModel"));
const sitterModel_1 = __importDefault(require("../Models/sitterModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const protectParent = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.parentjwt;
    console.log(token, 'hh');
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_PARENT_SECRET);
            console.log(decoded, 'decode');
            const user = yield parentModel_1.default.findById(decoded.id).select('-password');
            console.log(user, 'pp');
            if (user) {
                console.log(user, 'user');
                req.parent = user;
                console.log(req.parent, 'prentt');
                next();
                console.log('next() called');
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
exports.protectParent = protectParent;
const protectSitter = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.sitterjwt;
    console.log(token);
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SITTER_SECRET);
            const user = yield sitterModel_1.default.findById(decoded.id).select('-password');
            console.log(user, 'hee');
            if (user) {
                console.log('haa');
                req.sitter = user;
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
exports.protectSitter = protectSitter;
