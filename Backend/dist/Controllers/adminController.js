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
exports.unblockParent = exports.blockParent = exports.getParent = exports.unblockSitter = exports.blockSitter = exports.verifySitter = exports.getSitters = exports.getallParent = exports.adminLogout = exports.adminLogin = exports.registerAdmin = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const adminModel_1 = __importDefault(require("../Models/adminModel"));
const generateAdminToken_1 = __importDefault(require("../Utils/generateAdminToken"));
const sitterModel_1 = __importDefault(require("../Models/sitterModel"));
const parentModel_1 = __importDefault(require("../Models/parentModel"));
const registerAdmin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, adminRegistrationKey } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email or password is missing in the request, registration failed' });
            return;
        }
        if (!adminRegistrationKey) {
            res.status(400).json({ message: 'No admin registration code, registration aborted' });
            return;
        }
        if (process.env.ADMIN_REGISTRATION_KEY !== adminRegistrationKey) {
            res.status(401).json({ message: 'Invalid admin registration code' });
            return;
        }
        const userExists = yield adminModel_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists with this email' });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = new adminModel_1.default({
            name,
            email,
            password: hashedPassword,
        });
        yield user.save();
        if (user) {
            (0, generateAdminToken_1.default)(res, user._id);
            const registeredUserData = {
                _id: user._id,
                name: user.name,
                email: user.email,
            };
            res.status(201).json({ message: 'Registration successful', admin: registeredUserData });
        }
        else {
            res.status(400).json({ message: 'Invalid user data, registration failed' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.registerAdmin = registerAdmin;
const adminLogin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log(req.body);
        if (!email || !password) {
            res.status(401).json({ message: 'email or password is missining in the request' });
            return;
        }
        const admin = yield adminModel_1.default.findOne({ email: email });
        console.log(admin, 'oo');
        let passwordValid = false;
        if (admin) {
            passwordValid = yield bcryptjs_1.default.compare(password, admin.password);
            console.log(passwordValid, 'll');
        }
        if (passwordValid) {
            console.log('hey');
            (0, generateAdminToken_1.default)(res, admin._id); // Middleware to Generate token and send it back in response object
            const registeredAdminData = {
                name: admin.name,
                email: admin.email
            };
            res.status(201).json({ message: 'login successfully', admin: registeredAdminData });
        }
        if (!admin || !passwordValid) {
            res.status(401).json({ message: 'Invalid email or password,admin authenticaton failed' });
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.adminLogin = adminLogin;
const adminLogout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.cookie('adminJwt', '', {
            httpOnly: true,
            expires: new Date(0)
        });
        res.status(200).json({ message: 'logout user' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.adminLogout = adminLogout;
const getallParent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parent = yield parentModel_1.default.find({}, { name: 1, email: 1 });
        if (parent) {
            res.status(200).json({ parent });
        }
        else {
            res.status(404).json({ message: 'user data fetch failed' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.getallParent = getallParent;
const getSitters = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sitters = yield sitterModel_1.default.find({});
        if (!sitters || sitters.length === 0) {
            res.status(404).json({ message: 'No sitters found' });
            return;
        }
        console.log("Sitters found:", sitters);
        res.status(200).json([sitters]);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.getSitters = getSitters;
const verifySitter = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        const sitter = yield sitterModel_1.default.findById({ _id: sitterId });
        if (!sitter) {
            res.status(404).json({ message: "sitter not found" });
            return;
        }
        sitter.verified = true;
        yield sitter.save();
        res.status(200).json({ message: "Registered sitter verified" });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.verifySitter = verifySitter;
const blockSitter = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        const sitter = yield sitterModel_1.default.findById({ _id: sitterId });
        if (!sitter) {
            res.status(404).json({ message: "sitter not found" });
            return;
        }
        sitter.blocked = true;
        yield sitter.save();
        res.status(200).json({ message: 'sitter blocked' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.blockSitter = blockSitter;
const unblockSitter = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        const sitter = yield sitterModel_1.default.findById({ _id: sitterId });
        if (!sitter) {
            res.status(404).json({ message: "sitter not found" });
            return;
        }
        sitter.blocked = false;
        yield sitter.save();
        res.status(200).json({ message: 'sitter blocked' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.unblockSitter = unblockSitter;
const getParent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parents = yield parentModel_1.default.find({});
        if (!parents || parents.length === 0) {
            res.status(404).json({ message: 'No sitters found' });
            return;
        }
        console.log("Sitters found:", parents);
        res.status(200).json([parents]);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.getParent = getParent;
const blockParent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.params;
        const parent = yield parentModel_1.default.findById({ _id: parentId });
        if (!parent) {
            res.status(404).json({ message: "parent not found" });
            return;
        }
        parent.blocked = true;
        yield parent.save();
        res.status(200).json({ message: 'parent blocked' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.blockParent = blockParent;
const unblockParent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.params;
        const parent = yield parentModel_1.default.findById({ _id: parentId });
        console.log(parent);
        if (!parent) {
            res.status(404).json({ message: "parent not found" });
            return;
        }
        parent.blocked = false;
        yield parent.save();
        res.status(200).json({ message: 'sitter blocked' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.unblockParent = unblockParent;
