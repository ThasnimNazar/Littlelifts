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
exports.updateSeen = exports.getAllreviews = exports.getLastmessage = exports.lastSeen = exports.updateLastseen = exports.getReviews = exports.getUser = exports.removeFavourites = exports.getFavourites = exports.addFavourites = exports.getSubscription = exports.isBlocked = exports.postReview = exports.markSeen = exports.getMessages = exports.sendMessage = exports.createChat = exports.bookingsParent = exports.getSlots = exports.getName = exports.getAvailabledates = exports.filterBabysittersByDate = exports.searchBabysitters = exports.resendOtp = exports.resetparentPassword = exports.parentpasswordOtp = exports.forgotPassword = exports.verifyOtp = exports.parentLogout = exports.editProfile = exports.getProfile = exports.listSitter = exports.parentLogin = exports.registerParent = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const util_1 = require("util");
const parentModel_1 = __importDefault(require("../Models/parentModel"));
const parentotpModel_1 = __importDefault(require("../Models/parentotpModel"));
const generateParentToken_1 = __importDefault(require("../Utils/generateParentToken"));
const sitterModel_1 = __importDefault(require("../Models/sitterModel"));
const otpHelper_1 = __importDefault(require("../Helper/otpHelper"));
const upload_1 = require("../Connections/upload");
const weekendsittingModel_1 = __importDefault(require("../Models/weekendsittingModel"));
const occasionalsittingModel_1 = __importDefault(require("../Models/occasionalsittingModel"));
const specialcareModel_1 = __importDefault(require("../Models/specialcareModel"));
const childcategoryModel_1 = __importDefault(require("../Models/childcategoryModel"));
const bookingModel_1 = __importDefault(require("../Models/bookingModel"));
const chatModel_1 = __importDefault(require("../Models/chatModel"));
const messageModel_1 = __importDefault(require("../Models/messageModel"));
const reviewModel_1 = __importDefault(require("../Models/reviewModel"));
const socket_1 = require("../Connections/socket");
const subscriptionModel_1 = __importDefault(require("../Models/subscriptionModel"));
const favouritesModel_1 = __importDefault(require("../Models/favouritesModel"));
const usersubscriptionModel_1 = __importDefault(require("../Models/usersubscriptionModel"));
const uploadSinglePromise = (0, util_1.promisify)(upload_1.uploadSingle);
const uploadChatPromise = (0, util_1.promisify)(upload_1.uploadChatImage);
const registerParent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phoneno, password, confirmPassword, selectedchildcategory } = req.body;
        console.log('request', req.body);
        if (password !== confirmPassword) {
            res.status(400).json({ message: 'Password doesn\'t match' });
            return;
        }
        const parentExist = yield parentModel_1.default.findOne({ email });
        if (parentExist) {
            res.status(400).json({ message: 'Parent already exists with the email' });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const parent = new parentModel_1.default({
            name,
            email,
            phoneno,
            password: hashedPassword,
            selectedchildcategory,
            role: 'parent'
        });
        yield parent.save();
        console.log(parent, 'pp');
        const role = parent.role;
        console.log(role, 'role');
        yield sendOTPVerificationEmail({ id: parent._id, email: parent.email }, res);
        const token = (0, generateParentToken_1.default)(res, parent._id);
        console.log(token, 'kk');
        res.status(200).json({
            _id: parent._id,
            name,
            email,
            phoneno: phoneno,
            selectedchildcategory,
            parentToken: token,
            role
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.registerParent = registerParent;
const sendOTPVerificationEmail = (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ id, email }, res) {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const parentId = id;
        const saltRounds = 10;
        const hashedOtp = yield bcryptjs_1.default.hash(otp, saltRounds);
        const newOtpModel = new parentotpModel_1.default({
            _id: parentId,
            otp: hashedOtp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });
        yield newOtpModel.save();
        yield (0, otpHelper_1.default)(email, otp);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
            return;
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
            return;
        }
    }
});
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId, otp } = req.body;
        console.log(req.body);
        if (!parentId || !otp) {
            res.status(400).json({ message: 'Parent ID or OTP is required' });
            return;
        }
        const userId = new mongoose_1.default.Types.ObjectId(parentId);
        const parentOtpVerifyRecords = yield parentotpModel_1.default.find({ _id: userId });
        if (parentOtpVerifyRecords.length <= 0) {
            res.status(404).json({ message: "Account record doesn't exist or has already been verified" });
            return;
        }
        const { expiresAt, otp: hashedOtp } = parentOtpVerifyRecords[0];
        if (expiresAt.getTime() < Date.now()) {
            yield parentotpModel_1.default.deleteMany({ _id: userId });
            res.status(400).json({ message: 'Code has expired, please request again' });
            return;
        }
        const validOtp = yield bcryptjs_1.default.compare(otp, hashedOtp);
        if (!validOtp) {
            res.status(400).json({ message: 'The provided code is invalid. Please check your inbox' });
            return;
        }
        const parent = yield parentModel_1.default.findById(userId);
        if (!parent) {
            res.status(404).json({ message: 'Parent record not found' });
            return;
        }
        yield parent.updateOne({ _id: userId });
        yield parentotpModel_1.default.deleteMany({ _id: userId });
        res.json({
            status: "verified",
            _id: parent._id,
            name: parent.name,
            email: parent.email,
            phoneno: parent.phoneno
        });
    }
    catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
});
exports.verifyOtp = verifyOtp;
const resendOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.parent) {
        res.status(401).json({ message: 'Parent not authenticated' });
        return;
    }
    const parentId = req.parent._id;
    const email = req.parent.email;
    if (!parentId || !email) {
        res.status(400).json({ message: "No user Details" });
    }
    else {
        try {
            const deletionResult = yield parentotpModel_1.default.deleteMany({ _id: parentId });
            console.log("Deletion Result:", deletionResult);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to delete user OTPs" });
        }
        sendOTPVerificationEmail({ id: parentId, email }, res);
    }
}));
exports.resendOtp = resendOtp;
const parentLogin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email or password is required' });
            return;
        }
        const parentExists = yield parentModel_1.default.findOne({ email });
        if (!parentExists) {
            res.status(404).json({ message: 'Parent not found' });
            return;
        }
        if (parentExists.blocked) {
            res.status(401).json({ message: 'your account is blocked' });
            return;
        }
        const passwordMatch = yield bcryptjs_1.default.compare(password, parentExists.password);
        if (!passwordMatch) {
            res.status(400).json({ message: 'Incorrect password' });
            return;
        }
        const token = (0, generateParentToken_1.default)(res, parentExists._id);
        res.status(200).json({ parent: parentExists, message: 'Parent logged in successfully', parentToken: token, role: parentExists === null || parentExists === void 0 ? void 0 : parentExists.role });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.parentLogin = parentLogin;
const listSitter = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received request for listing sitters');
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const lat = req.query.lat;
        const lng = req.query.lng;
        const radius = req.query.radius;
        if (!lat || !lng || !radius) {
            res.status(400).json({ message: 'Latitude, longitude, and radius are required.' });
            return;
        }
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusInKm = parseFloat(radius);
        if (radiusInKm <= 0) {
            res.status(400).json({ message: 'Radius must be a positive number.' });
            return;
        }
        const radiusInRadians = radiusInKm / 6371;
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);
        console.log('Radius in km:', radiusInKm);
        console.log('Radius in radians:', radiusInRadians);
        const query = {
            location: {
                $geoWithin: {
                    $centerSphere: [
                        [longitude, latitude],
                        radiusInRadians
                    ]
                }
            },
            blocked: false
        };
        console.log('Query:', JSON.stringify(query));
        const babysitters = yield sitterModel_1.default.find(query);
        console.log('Babysitters found:', babysitters);
        const total = yield sitterModel_1.default.countDocuments(query);
        console.log('Total sitters found:', total);
        res.status(200).json({ sitters: babysitters, total });
    }
    catch (error) {
        console.error('Error while listing sitters:', error);
        res.status(500).json({ message: 'An unknown error occurred' });
    }
}));
exports.listSitter = listSitter;
const getProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.params;
        const parent = yield parentModel_1.default.findById({ _id: parentId });
        if (parent) {
            res.status(200).json({ parent });
        }
        else {
            res.status(404).json({ message: 'failed to fetch parent details' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.getProfile = getProfile;
const editProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield uploadSinglePromise(req, res);
        const { parentId } = req.params;
        const { name, phoneno } = req.body;
        const profileImageUrl = req.file.location;
        const updatedData = {};
        if (profileImageUrl) {
            updatedData.profileImage = profileImageUrl;
        }
        if (name) {
            updatedData.name = name;
        }
        if (phoneno) {
            updatedData.phoneno = phoneno;
        }
        const parent = yield parentModel_1.default.findByIdAndUpdate(parentId, { $set: updatedData }, { new: true }).select('-password');
        console.log(parent, 'll');
        if (!parent) {
            res.status(404).json({ error: 'Parent not found' });
            return;
        }
        res.status(200).json({ parent });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.editProfile = editProfile;
const parentLogout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('logout');
        res.cookie('parentjwt', '', {
            httpOnly: true,
            expires: new Date(0)
        });
        res.status(200).json({ message: 'logout user' });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.parentLogout = parentLogout;
const forgotPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        console.log(email, 'eeee');
        const parent = yield parentModel_1.default.findOne({ email });
        if (!parent) {
            res.status(401).json({ message: 'User not found, User authentication failed, Please SignUp again' });
            return;
        }
        else {
            (0, generateParentToken_1.default)(res, parent._id);
            sendOTPVerificationEmail(parent, res);
        }
        res.status(200).json({ message: "otp send" });
    }
    catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
}));
exports.forgotPassword = forgotPassword;
const parentpasswordOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp } = req.body;
        if (!req.parent) {
            res.status(401).json({ message: 'Parent not authenticated' });
            return;
        }
        const parentId = req.parent._id;
        console.log(parentId);
        if (!otp) {
            res.status(400).json({ message: 'Empty passwords are not allowed' });
            return;
        }
        const parentOtpVerifyRecords = yield parentotpModel_1.default.find({ _id: parentId });
        if (parentOtpVerifyRecords.length <= 0) {
            res.status(404).json({ message: 'Account record doesn\'t exist or it is already verified' });
            return;
        }
        const { expiresAt, otp: hashedOtp } = parentOtpVerifyRecords[0];
        if (expiresAt.getTime() < Date.now()) {
            yield parentotpModel_1.default.deleteMany({ _id: parentId });
            res.status(400).json({ message: 'Code has expired, please request again' });
            return;
        }
        const validOtp = yield bcryptjs_1.default.compare(otp.toString(), hashedOtp);
        if (!validOtp) {
            res.status(500).json({ message: 'The code you provided is invalid. Please check your inbox' });
            return;
        }
        const parent = yield parentModel_1.default.findById(new mongoose_1.default.Types.ObjectId(parentId));
        if (!parent) {
            res.status(404).json({ message: 'Parent not found' });
            return;
        }
        yield parent.updateOne({ _id: new mongoose_1.default.Types.ObjectId(parentId) });
        yield parentotpModel_1.default.deleteMany({ _id: parentId });
        res.json({
            status: 'verified',
            _id: parent._id,
            name: parent.name,
            email: parent.email,
            phoneNumber: parent.phoneno,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'Failed',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
}));
exports.parentpasswordOtp = parentpasswordOtp;
const resetparentPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newPassword = req.body.password;
        const confirmPassword = req.body.confirmPassword;
        if (!newPassword || !confirmPassword) {
            res.status(400).json({ message: 'password and confirm password is required' });
            return;
        }
        if (newPassword !== confirmPassword) {
            res.status(400).json({ message: 'password doesnt match' });
            return;
        }
        if (!req.parent) {
            res.status(401).json({ message: 'Parent not authenticated' });
            return;
        }
        const parentId = req.parent._id;
        const parent = yield parentModel_1.default.findById(parentId);
        if (!parent) {
            res.status(404).json({ message: 'Parent not found' });
            return;
        }
        if (newPassword) {
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            parent.password = hashedPassword;
        }
        const updatedUserData = yield parent.save();
        res.status(200).json({ message: "password updated", updatedUserData });
    }
    catch (error) {
        res.status(500).json({
            status: 'Failed',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
}));
exports.resetparentPassword = resetparentPassword;
const searchBabysitters = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, selectedSittingOption, childcategory } = req.query;
        console.log(req.query);
        let query = {};
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }
        if (selectedSittingOption) {
            query.selectedSittingOption = selectedSittingOption;
        }
        if (childcategory) {
            query.childcategory = childcategory;
        }
        const sitters = yield sitterModel_1.default.find(query).populate('Sittingcategory').populate('Category');
        console.log(sitters, 'hyy');
        res.status(200).json({ sitters });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.searchBabysitters = searchBabysitters;
const filterBabysittersByDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { selectedDate } = req.query;
    if (!selectedDate || typeof selectedDate !== 'string') {
        return res.status(400).json({ message: 'Invalid selectedDate parameter' });
    }
    try {
        const dateToFilter = new Date(selectedDate);
        dateToFilter.setUTCHours(0, 0, 0, 0);
        console.log(dateToFilter);
        const weekendSitters = yield weekendsittingModel_1.default.find({
            'availableDates.date': dateToFilter
        }).populate('sitter');
        console.log(weekendSitters, 'wee');
        const occasionalSitters = yield occasionalsittingModel_1.default.find({
            'availableDates.date': dateToFilter
        }).populate('sitter');
        const specialCareSitters = yield specialcareModel_1.default.find({
            'availableDates.date': dateToFilter
        }).populate('sitter');
        const allBabysitters = [
            ...weekendSitters.map(sitter => sitter.sitter),
            ...occasionalSitters.map(sitter => sitter.sitter),
            ...specialCareSitters.map(sitter => sitter.sitter)
        ];
        console.log(allBabysitters);
        res.status(200).json({ babysitters: allBabysitters });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.filterBabysittersByDate = filterBabysittersByDate;
const getAvailabledates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        const sitter = yield sitterModel_1.default.findById(sitterId);
        if (!sitter) {
            return res.status(404).json({ message: 'Sitter not found' });
        }
        let availableDates = [];
        let offDates = [];
        if (sitter.weekendSlots && sitter.weekendSlots.length > 0) {
            const weekendSlots = yield weekendsittingModel_1.default.find({ _id: { $in: sitter.weekendSlots } });
            weekendSlots.forEach(slot => {
                slot.availableDates.forEach(dateSlot => {
                    availableDates.push(new Date(dateSlot.date)); // Accessing the date field
                });
                offDates = offDates.concat(slot.offDates || []);
            });
        }
        if (sitter.occasionalSlots && sitter.occasionalSlots.length > 0) {
            const occasionalSlots = yield occasionalsittingModel_1.default.find({ _id: { $in: sitter.occasionalSlots } });
            occasionalSlots.forEach(slot => {
                slot.availableDates.forEach(dateSlot => {
                    availableDates.push(new Date(dateSlot.date));
                });
                offDates = offDates.concat(slot.offDates || []);
            });
        }
        if (sitter.specialCareSlots && sitter.specialCareSlots.length > 0) {
            const specialCareSlots = yield specialcareModel_1.default.find({ _id: { $in: sitter.specialCareSlots } });
            specialCareSlots.forEach(slot => {
                slot.availableDates.forEach(dateSlot => {
                    availableDates.push(new Date(dateSlot.date));
                });
                offDates = offDates.concat(slot.offDates || []);
            });
        }
        res.status(200).json({ availableDates, offDates });
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
});
exports.getAvailabledates = getAvailabledates;
const getName = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('heyy');
        const { ids } = req.body;
        console.log(req.body, 'bodyyyy');
        const childcategories = yield childcategoryModel_1.default.find({ _id: { $in: ids } });
        console.log(childcategories, 'hehe');
        if (!childcategories) {
            return res.status(404).json({ message: 'Categories not found' });
        }
        const names = childcategories.map(category => category.name);
        res.status(200).json({ names });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        }
        else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}));
exports.getName = getName;
const getSlots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        console.log(sitterId, 'sitter');
        const sitter = yield sitterModel_1.default.findById(sitterId).exec();
        console.log(sitter, 'id');
        if (!sitter) {
            return res.status(404).json({ message: "Sitter not found" });
        }
        let slots = [];
        if (sitter.weekendSlots && sitter.weekendSlots.length > 0) {
            slots = yield weekendsittingModel_1.default.find({ _id: { $in: sitter.weekendSlots } }).exec();
        }
        else if (sitter.occasionalSlots && sitter.occasionalSlots.length > 0) {
            slots = yield occasionalsittingModel_1.default.find({ _id: { $in: sitter.occasionalSlots } }).exec();
        }
        else if (sitter.specialCareSlots && sitter.specialCareSlots.length > 0) {
            slots = yield specialcareModel_1.default.find({ _id: { $in: sitter.specialCareSlots } }).exec();
        }
        const formattedSlots = slots.map(slot => {
            const slotObject = slot.toObject();
            return Object.assign(Object.assign({}, slotObject), { availableDates: slotObject.availableDates.map(dateSlot => (Object.assign(Object.assign({}, dateSlot), { timeslots: dateSlot.timeslots.map(timeslot => (Object.assign(Object.assign({}, timeslot), { startTime: timeslot.startTime.toISOString(), endTime: timeslot.endTime.toISOString(), status: timeslot.bookingStatus === 'approved' ? 'unavailable' : timeslot.bookingStatus }))) }))) });
        });
        res.status(200).json({ slots: formattedSlots });
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
});
exports.getSlots = getSlots;
const bookingsParent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.params;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const totalCount = yield bookingModel_1.default.countDocuments({ parent: parentId });
        const findBookings = yield bookingModel_1.default.find({ parent: parentId })
            .populate({
            path: 'sitter',
            select: '-password',
        })
            .skip(skip)
            .limit(limit);
        console.log(findBookings, 'jjjjj');
        res.status(200).json({
            bookings: findBookings,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
        });
        const totalPages = Math.ceil(totalCount / limit);
        console.log(totalPages, 'gg');
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
exports.bookingsParent = bookingsParent;
const createChat = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId, sitterId } = req.body;
        let chat = yield chatModel_1.default.findOne({
            participants: { $all: [parentId, sitterId] }
        });
        if (!chat) {
            chat = new chatModel_1.default({
                participants: [parentId, sitterId],
                messages: []
            });
            yield chat.save();
        }
        res.status(201).json(chat);
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
exports.createChat = createChat;
const sendMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield new Promise((resolve, reject) => {
            (0, upload_1.uploadFields)(req, res, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
        const { chatId, senderId, content, timestamp } = req.body;
        console.log(req.body, 'jj');
        const imageUrl = req.files && req.files.image ? req.files.image[0].location : '';
        const videoUrl = req.files && req.files.video ? req.files.video[0].location : '';
        const audioUrl = req.files && req.files.audio ? req.files.audio[0].location : '';
        const message = new messageModel_1.default({
            chat: chatId,
            sender: senderId,
            content: content,
            timestamp: new Date(timestamp),
            ImageUrl: imageUrl || '',
            VideoUrl: videoUrl || '',
            AudioUrl: audioUrl || '',
        });
        yield message.save();
        console.log(message, 'msg');
        yield chatModel_1.default.findByIdAndUpdate(chatId, {
            $push: { messages: message._id },
            lastMessage: content,
            lastMessageTimestamp: new Date(timestamp)
        }, { new: true });
        res.status(200).json({ message });
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
exports.sendMessage = sendMessage;
const getMessages = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const messages = yield messageModel_1.default.find({ chat: chatId }).sort({ timestamp: 1 });
        console.log(messages, 'mes');
        res.status(200).json({ messages });
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
exports.getMessages = getMessages;
const getLastmessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const chat = yield chatModel_1.default.findById(chatId).populate('lastMessage')
            .exec();
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.status(200).json({ chat });
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
});
exports.getLastmessage = getLastmessage;
const markSeen = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, userId } = req.body;
        const io = (0, socket_1.getSocketIOInstance)();
        yield messageModel_1.default.updateMany({ chat: chatId, seenBy: { $ne: userId } }, { $push: { seenBy: userId } });
        res.status(200).json({ message: 'Messages marked as seen' });
        io.to(chatId).emit('messagesMarkedSeen', { userId });
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
exports.markSeen = markSeen;
const postReview = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { review, rating, bookingId } = req.body;
        console.log(req.body);
        const bookings = yield bookingModel_1.default.findById(bookingId).populate('sitter parent');
        if (!bookings) {
            res.status(404).json({ message: 'booking not found' });
            return;
        }
        const newReview = new reviewModel_1.default({
            booking: bookingId,
            sitter: bookings.sitter._id,
            parent: bookings.parent._id,
            rating: rating,
            comment: review
        });
        yield newReview.save();
        bookings.reviewSubmitted = true;
        yield bookings.save();
        res.status(200).json({ newReview });
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
exports.postReview = postReview;
const isBlocked = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.query;
        const parent = yield parentModel_1.default.findById({ _id: parentId });
        if (!parent) {
            res.status(404).json({ message: 'parent not found' });
            return;
        }
        if (parent.blocked) {
            res.status(200).json({ parent, message: 'You are blocked' });
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
exports.isBlocked = isBlocked;
const getSubscription = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscription = yield subscriptionModel_1.default.find({});
        if (!subscription) {
            res.status(404).json({ message: 'subscription not found' });
            return;
        }
        res.status(200).json({ subscription });
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
exports.getSubscription = getSubscription;
const addFavourites = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId, parentId } = req.body;
        const sitter = yield sitterModel_1.default.findById(sitterId);
        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' });
            return;
        }
        const parent = yield parentModel_1.default.findById(parentId);
        if (!parent) {
            res.status(404).json({ message: 'Parent not found' });
            return;
        }
        const favourites = yield favouritesModel_1.default.findOne({ parent: parentId });
        if (favourites) {
            if (favourites.sitters.includes(sitterId)) {
                res.status(400).json({ message: 'babysitter is already added to favourites' });
                return;
            }
            favourites.sitters.push(sitterId);
            yield favourites.save();
            res.status(200).json({ message: 'babysitter addedd successfully' });
            return;
        }
        else {
            const newFavourites = new favouritesModel_1.default({
                sitters: [sitterId],
                parent: parentId
            });
            yield newFavourites.save();
            console.log(newFavourites, 'fav');
            res.status(200).json({ message: "Added to favourites" });
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
exports.addFavourites = addFavourites;
const getFavourites = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.params;
        const favourites = yield favouritesModel_1.default.findOne({ parent: parentId }).populate({ path: 'sitters', select: 'name email phoneno profileImage' })
            .set('strictPopulate', false);
        console.log(favourites, 'favs');
        if (!favourites) {
            res.status(400).json({ message: 'no favourites to display' });
            return;
        }
        res.status(200).json({ favourites });
        return;
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
exports.getFavourites = getFavourites;
const removeFavourites = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.body;
        const { parentId } = req.params;
        const id = new mongoose_1.default.Types.ObjectId(parentId);
        const favourites = yield favouritesModel_1.default.findOne({ parent: parentId });
        console.log(favourites, 'll');
        if (!favourites) {
            res.status(404).json({ message: 'fav sitters not found' });
            return;
        }
        if (!(favourites === null || favourites === void 0 ? void 0 : favourites.sitters.includes(sitterId))) {
            res.status(404).json({ message: 'sitter not found in the favourites' });
            return;
        }
        favourites.sitters.pull(sitterId);
        yield favourites.save();
        res.status(200).json({ message: 'removed babysitters from favourites' });
        return;
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
exports.removeFavourites = removeFavourites;
const getUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.params;
        const userSubscription = yield usersubscriptionModel_1.default.findOne({ userId: parentId });
        console.log(userSubscription, 'uu');
        if (!userSubscription) {
            res.status(404).json({ message: 'subscription not found' });
            return;
        }
        res.status(200).json({ userSubscription });
        return;
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
exports.getUser = getUser;
const getReviews = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        console.log(sitterId);
        const review = yield reviewModel_1.default.find({ sitter: sitterId });
        if (!review) {
            res.status(404).json({ message: 'review not found' });
            return;
        }
        res.status(200).json({ review });
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
exports.getReviews = getReviews;
const updateLastseen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.params;
        const updateParent = yield parentModel_1.default.findByIdAndUpdate(parentId, {
            lastseen: new Date()
        }, {
            new: true
        });
        if (!updateParent) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        res.status(200).json({ lastseen: updateParent.lastseen });
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
});
exports.updateLastseen = updateLastseen;
const lastSeen = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.query;
        console.log(sitterId, 'id');
        const sitter = yield sitterModel_1.default.findById(sitterId);
        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' });
            return;
        }
        const lastseen = sitter === null || sitter === void 0 ? void 0 : sitter.lastseen;
        res.status(200).json(lastseen);
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
exports.lastSeen = lastSeen;
const getAllreviews = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviews = yield reviewModel_1.default.find({}).populate({ path: 'parent', select: 'profileImage name' });
        if (!reviews) {
            res.status(400).json({ message: "reviews not found" });
            return;
        }
        res.status(200).json({ reviews });
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
exports.getAllreviews = getAllreviews;
const updateSeen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.query;
        const { parentId } = req.params;
        console.log(parentId, 'parentid-seen');
        console.log(chatId, 'chatidddd');
        if (!parentId || !chatId) {
            return res.status(400).json({ message: 'parentId and chatId are required' });
        }
        const unseenMessages = yield messageModel_1.default.find({
            chat: chatId,
            seenBy: { $ne: parentId }
        });
        if (unseenMessages.length === 0) {
            return res.status(200).json({ message: 'No unseen messages' });
        }
        for (const message of unseenMessages) {
            message.seenBy.push(parentId);
            yield message.save();
        }
        res.status(200).json({ message: 'Messages marked as seen' });
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
});
exports.updateSeen = updateSeen;
