"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
        cb(null, true); // No error, accept the file
    }
    else {
        const error = new Error('Invalid file type. Only JPEG and JPG files are allowed.');
        cb(error, false); // Error encountered, reject the file
    }
};
exports.upload = (0, multer_1.default)({ storage, fileFilter });
