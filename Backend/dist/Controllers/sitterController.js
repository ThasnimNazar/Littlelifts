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
exports.postSeen = exports.lastMsg = exports.getLastseen = exports.lastSeen = exports.getReview = exports.checkBlocked = exports.getMessages = exports.sendMessage = exports.createChat = exports.bookingsList = exports.editTimeslot = exports.getBabysitter = exports.editSlot = exports.geteditSlot = exports.getSittingcategory = exports.getSlots = exports.editProfile = exports.sitterLogin = exports.resetsitterPassword = exports.sitterpasswordOtp = exports.sitterforgotPassword = exports.sitresendOtp = exports.sitterverifyOtp = exports.getsitterProfile = exports.getStatus = exports.uploadVerificationDocuments = exports.manageSlots = exports.saveSittingOption = exports.sitterLogout = exports.getsittingOptions = exports.sitterregisterStep3 = exports.sitterregisterStep2 = exports.sitterregisterStep1 = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const util_1 = require("util");
const generatesitterToken_1 = __importDefault(require("../Utils/generatesitterToken"));
const otpHelper_1 = __importDefault(require("../Helper/otpHelper"));
const sitterotpmodel_1 = __importDefault(require("../Models/sitterotpmodel"));
const sittingcategoryModel_1 = __importDefault(require("../Models/sittingcategoryModel"));
const sitterModel_1 = __importDefault(require("../Models/sitterModel"));
const slotHelper_1 = require("../Helper/slotHelper");
const bookingModel_1 = __importDefault(require("../Models/bookingModel"));
const upload_1 = require("../Connections/upload");
const weekendsittingModel_1 = __importDefault(require("../Models/weekendsittingModel"));
const occasionalsittingModel_1 = __importDefault(require("../Models/occasionalsittingModel"));
const specialcareModel_1 = __importDefault(require("../Models/specialcareModel"));
const chatModel_1 = __importDefault(require("../Models/chatModel"));
const messageModel_1 = __importDefault(require("../Models/messageModel"));
const reviewModel_1 = __importDefault(require("../Models/reviewModel"));
const parentModel_1 = __importDefault(require("../Models/parentModel"));
const uploadMultiplePromise = (0, util_1.promisify)(upload_1.uploadMultiple);
const uploadSingleImagePromise = (0, util_1.promisify)(upload_1.uploadSingle);
const sitterregisterStep1 = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phoneno, password, confirmPassword, gender, location } = req.body;
        console.log(req.body, 'body');
        const sitterExist = yield sitterModel_1.default.findOne({ email });
        if (sitterExist) {
            res.status(400).json({ message: 'A user with this email already exists' });
            return;
        }
        const sitterExistWithPhone = yield sitterModel_1.default.findOne({ phoneno });
        if (sitterExistWithPhone) {
            res.status(400).json({ message: 'A user with this phone number already exists' });
            return;
        }
        if (password !== confirmPassword) {
            res.status(400).json({ message: 'password doesnt match' });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const { latitude, longitude } = location;
        const sitter = new sitterModel_1.default({
            name: name,
            email: email,
            password: hashedPassword,
            phoneno: phoneno,
            gender: gender,
            role: 'sitter',
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            }
        });
        yield sitter.save();
        yield sendOTPVerificationEmail({ id: sitter._id, email: sitter.email }, res);
        const token = (0, generatesitterToken_1.default)(res, sitter._id);
        if (sitter) {
            res.status(200).json({ message: 'Registration successful', sitter: sitter, sitterToken: token });
        }
    }
    catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
}));
exports.sitterregisterStep1 = sitterregisterStep1;
const sendOTPVerificationEmail = (_a, res_1) => __awaiter(void 0, [_a, res_1], void 0, function* ({ id, email }, res) {
    console.log('heyy');
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const sitterId = id;
        console.log(sitterId);
        const saltRounds = 10;
        const hashedOtp = yield bcryptjs_1.default.hash(otp, saltRounds);
        const newOtpModel = new sitterotpmodel_1.default({
            _id: sitterId,
            otp: hashedOtp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });
        console.log(newOtpModel, 'otp');
        yield newOtpModel.save();
        yield (0, otpHelper_1.default)(email, otp);
        console.log('OTP sent');
    }
    catch (error) {
        res.status(500).json({ message: 'An error occurred while sending the OTP verification email' });
    }
});
const sitterverifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId, otp } = req.body;
        if (!sitterId || !otp) {
            res.status(400).json({ message: 'Parent ID or OTP is required' });
            return;
        }
        const userId = new mongoose_1.default.Types.ObjectId(sitterId);
        const parentOtpVerifyRecords = yield sitterotpmodel_1.default.find({ _id: userId });
        if (parentOtpVerifyRecords.length <= 0) {
            res.status(404).json({ message: "Account record doesn't exist or has already been verified" });
            return;
        }
        const { expiresAt, otp: hashedOtp } = parentOtpVerifyRecords[0];
        if (expiresAt.getTime() < Date.now()) {
            yield sitterotpmodel_1.default.deleteMany({ _id: userId });
            res.status(400).json({ message: 'Code has expired, please request again' });
            return;
        }
        const validOtp = yield bcryptjs_1.default.compare(otp, hashedOtp);
        if (!validOtp) {
            res.status(400).json({ message: 'The provided code is invalid. Please check your inbox' });
            return;
        }
        const sitter = yield sitterModel_1.default.findById(userId);
        if (!sitter) {
            res.status(404).json({ message: 'Parent record not found' });
            return;
        }
        yield sitter.updateOne({ _id: userId });
        yield sitterotpmodel_1.default.deleteMany({ _id: userId });
        res.json({
            status: "verified",
            sitter
        });
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
});
exports.sitterverifyOtp = sitterverifyOtp;
const sitresendOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.sitter) {
        res.status(401).json({ message: 'Sitter not authenticated' });
        return;
    }
    const sitterId = req.sitter._id;
    const email = req.sitter.email;
    if (!sitterId || !email) {
        res.status(400).json({ message: "No user Details" });
        return;
    }
    else {
        try {
            const deletionResult = yield sitterotpmodel_1.default.deleteMany({ _id: sitterId });
            console.log("Deletion Result:", deletionResult);
        }
        catch (error) {
            res.status(500).json({ message: "Failed to delete user OTPs" });
        }
        sendOTPVerificationEmail({ id: sitterId, email }, res);
    }
}));
exports.sitresendOtp = sitresendOtp;
const sitterforgotPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        console.log(email, 'eeee');
        const sitter = yield sitterModel_1.default.findOne({ email });
        console.log(sitter);
        if (!sitter) {
            res.status(401).json({ message: 'User not found, User authentication failed, Please SignUp again' });
            return;
        }
        else {
            (0, generatesitterToken_1.default)(res, sitter._id);
            sendOTPVerificationEmail(sitter, res);
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
exports.sitterforgotPassword = sitterforgotPassword;
const sitterpasswordOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp } = req.body;
        if (!req.sitter) {
            res.status(401).json({ message: 'Parent not authenticated' });
            return;
        }
        const sitterId = req.sitter._id;
        console.log(sitterId);
        if (!otp) {
            res.status(400).json({ message: 'Empty passwords are not allowed' });
            return;
        }
        const sitterOtpVerifyRecords = yield sitterotpmodel_1.default.find({ _id: sitterId });
        if (sitterOtpVerifyRecords.length <= 0) {
            res.status(404).json({ message: 'Account record doesn\'t exist or it is already verified' });
            return;
        }
        const { expiresAt, otp: hashedOtp } = sitterOtpVerifyRecords[0];
        if (expiresAt.getTime() < Date.now()) {
            yield sitterotpmodel_1.default.deleteMany({ _id: sitterId });
            res.status(400).json({ message: 'Code has expired, please request again' });
            return;
        }
        const validOtp = yield bcryptjs_1.default.compare(otp.toString(), hashedOtp);
        if (!validOtp) {
            res.status(500).json({ message: 'The code you provided is invalid. Please check your inbox' });
            return;
        }
        const sitter = yield sitterModel_1.default.findById(new mongoose_1.default.Types.ObjectId(sitterId));
        if (!sitter) {
            res.status(404).json({ message: 'Sitter not found' });
            return;
        }
        yield sitter.updateOne({ _id: new mongoose_1.default.Types.ObjectId(sitterId) });
        yield sitterotpmodel_1.default.deleteMany({ _id: sitterId });
        res.json({
            status: 'verified',
            Sitter: sitterModel_1.default
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'Failed',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
}));
exports.sitterpasswordOtp = sitterpasswordOtp;
const resetsitterPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!req.sitter) {
            res.status(401).json({ message: 'Parent not authenticated' });
            return;
        }
        const sitterId = req.sitter._id;
        const sitter = yield sitterModel_1.default.findById({ _id: sitterId });
        if (!sitter) {
            res.status(404).json({ message: 'Parent not found' });
            return;
        }
        if (newPassword) {
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            sitter.password = hashedPassword;
        }
        const updatedUserData = yield sitter.save();
        res.status(200).json({ message: "password updated", updatedUserData });
    }
    catch (error) {
        res.status(500).json({
            status: 'Failed',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
}));
exports.resetsitterPassword = resetsitterPassword;
const sitterregisterStep2 = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        const { yearofexperience, workwithpet, maxchildren, servicepay, about, selectedcategories } = req.body;
        console.log(req.body);
        const sitter = yield sitterModel_1.default.findOne({ _id: sitterId });
        const childCategoryIds = selectedcategories.map((id) => new mongoose_1.default.Types.ObjectId(id));
        if (!sitter) {
            res.status(404).json({ message: 'Sitter not found' });
            return;
        }
        sitter.yearofexperience = yearofexperience;
        sitter.workwithpet = workwithpet;
        sitter.maxchildren = maxchildren;
        sitter.servicepay = servicepay;
        sitter.childcategory = childCategoryIds;
        sitter.about = about;
        const updatedSitter = yield sitter.save();
        res.status(200).json({
            message: 'Sitter updated successfully',
            sitter: updatedSitter
        });
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
exports.sitterregisterStep2 = sitterregisterStep2;
const sitterregisterStep3 = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        const { activities, more } = req.body;
        if (!activities || !more) {
            res.status(400).json({ message: 'atleast one activities or more skill required' });
        }
        console.log(req.body, 'ddd');
        const sitter = yield sitterModel_1.default.findById({ _id: sitterId });
        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' });
            return;
        }
        sitter.activities = activities;
        sitter.more = more;
        const updatedSitter = yield sitter.save();
        res.status(200).json({ message: 'skills added successfully', sitter: updatedSitter });
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
exports.sitterregisterStep3 = sitterregisterStep3;
const getsittingOptions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sittingOptions = yield sittingcategoryModel_1.default.find({});
        res.status(200).json(sittingOptions);
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
exports.getsittingOptions = getsittingOptions;
const saveSittingOption = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        const { selectedOption, selectedOptionId } = req.body;
        if (!sitterId) {
            return res.status(400).json({ message: 'Sitter ID is required' });
        }
        if (!selectedOption || !selectedOptionId) {
            return res.status(400).json({ message: 'Selected option and option ID are required' });
        }
        const sitter = yield sitterModel_1.default.findById(sitterId);
        if (!sitter) {
            return res.status(404).json({ message: 'Sitter not found' });
        }
        sitter.selectedSittingOption = new mongoose_1.default.Types.ObjectId(selectedOptionId);
        yield sitter.save();
        return res.status(200).json({ message: 'Selected sitting option saved successfully', sitter });
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
});
exports.saveSittingOption = saveSittingOption;
const manageSlots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { sitterId, selectedOptionId } = req.params;
        const { selectedOption, slotData } = req.body;
        console.log(req.body, 'kk');
        if (!sitterId) {
            return res.status(400).json({ message: 'Sitter ID is required' });
        }
        if (!selectedOption || !selectedOptionId || !slotData) {
            return res.status(400).json({ message: 'Selected option, option ID, and slot data are required' });
        }
        const sitter = yield sitterModel_1.default.findById(sitterId);
        if (!sitter) {
            return res.status(404).json({ message: 'Sitter not found' });
        }
        sitter.weekendSlots = [];
        sitter.occasionalSlots = [];
        sitter.specialCareSlots = [];
        let result;
        let createdSlotId;
        switch (selectedOption) {
            case 'Weekend Sitting':
                result = yield (0, slotHelper_1.createWeekendSittingSlot)(Object.assign({ sittingCategoryId: selectedOptionId, sitterId }, slotData));
                createdSlotId = (_a = result.weekendSittingSlot) === null || _a === void 0 ? void 0 : _a._id;
                ;
                if (createdSlotId)
                    sitter.weekendSlots.push(createdSlotId);
                break;
            case 'Occasional Sitting':
                result = yield (0, slotHelper_1.createOccasionalSittingSlot)(Object.assign({ sittingCategoryId: selectedOptionId, sitterId }, slotData));
                createdSlotId = (_b = result.occasionalSittingSlot) === null || _b === void 0 ? void 0 : _b._id;
                ;
                if (createdSlotId)
                    sitter.occasionalSlots.push(createdSlotId);
                break;
            case 'Specialcare Sitting':
                result = yield (0, slotHelper_1.createSpecialCareSittingSlot)(Object.assign({ sittingCategoryId: selectedOptionId, sitterId }, slotData));
                createdSlotId = (_c = result.specialCareSittingSlot) === null || _c === void 0 ? void 0 : _c._id;
                ;
                if (createdSlotId)
                    sitter.specialCareSlots.push(createdSlotId);
                break;
            default:
                return res.status(400).json({ message: 'Invalid sitting option' });
        }
        if (result.success) {
            yield sitter.save();
            return res.status(200).json({ message: 'Slots managed successfully', sitter });
        }
        else {
            return res.status(500).json({ message: result.message });
        }
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : 'An unknown error occurred');
        res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
});
exports.manageSlots = manageSlots;
const uploadVerificationDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('hello');
    try {
        yield uploadMultiplePromise(req, res);
        const { sitterId } = req.params;
        const verificationDocsUrls = req.files.map((file) => file.location);
        const sitter = yield sitterModel_1.default.findByIdAndUpdate(sitterId, { $push: { verificationDocuments: { $each: verificationDocsUrls } } }, { new: true }).select('-password -verificationDocuments');
        if (!sitter) {
            return res.status(404).json({ error: 'Sitter not found' });
        }
        res.status(200).json(sitter);
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
exports.uploadVerificationDocuments = uploadVerificationDocuments;
const getStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        const sitter = yield sitterModel_1.default.findById({ _id: sitterId }).select('-password -verificationDocuments');
        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' });
            return;
        }
        res.status(200).json({ sitter });
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
exports.getStatus = getStatus;
const getsitterProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        const sitter = yield sitterModel_1.default.findById(sitterId);
        console.log(sitter);
        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' });
            return;
        }
        if ((sitter === null || sitter === void 0 ? void 0 : sitter.blocked) === true) {
            res.status(403).json({ message: 'Your account is blocked' });
            return;
        }
        res.status(200).json({ sitter });
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
exports.getsitterProfile = getsitterProfile;
const sitterLogin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log(req.body, 'hyy');
        if (!email || !password) {
            res.status(400).json({ message: "email and password required" });
            return;
        }
        const sitter = yield sitterModel_1.default.findOne({ email });
        console.log(sitter, 'hey');
        if (!sitter) {
            res.status(404).json({ message: "sitter not found" });
            return;
        }
        if (!(sitter === null || sitter === void 0 ? void 0 : sitter.role)) {
            sitter.role = 'sitter';
            yield sitter.save();
        }
        if (sitter.blocked === true) {
            res.status(403).json({ message: 'Your account is blocked' });
            return;
        }
        if (sitter.verified === true) {
            const passwordMatch = yield bcryptjs_1.default.compare(password, sitter.password);
            if (!passwordMatch) {
                res.status(400).json({ message: 'Incorrect password' });
                return;
            }
            const token = (0, generatesitterToken_1.default)(res, sitter._id);
            res.status(200).json({ sitter: sitter, sitterToken: token, message: 'Sitter logged in successfully' });
        }
        else {
            res.status(400).json({ message: "your profile is not verified,please verify to login" });
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
exports.sitterLogin = sitterLogin;
const editProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield uploadSingleImagePromise(req, res);
        const { sitterId } = req.params;
        const sitterBlock = yield sitterModel_1.default.findById(sitterId);
        if ((sitterBlock === null || sitterBlock === void 0 ? void 0 : sitterBlock.blocked) === true) {
            res.status(403).json({ message: 'Your account is blocked' });
            return;
        }
        const profileImageUrl = req.file ? req.file.location : undefined;
        console.log(profileImageUrl);
        const updateFields = {};
        if (req.body.name)
            updateFields.name = req.body.name;
        if (req.body.email)
            updateFields.email = req.body.email;
        if (req.body.phoneno)
            updateFields.phoneno = req.body.phoneno;
        if (req.body.gender)
            updateFields.gender = req.body.gender;
        if (req.body.workwithpet)
            updateFields.workwithpet = req.body.workwithpet;
        if (req.body.servicepay)
            updateFields.servicepay = req.body.servicepay;
        if (req.body.yearofexperience)
            updateFields.yearofexperience = req.body.yearofexperience;
        if (req.body.maxchildren)
            updateFields.maxchildren = req.body.maxchildren;
        if (req.body.about)
            updateFields.about = req.body.about;
        if (profileImageUrl)
            updateFields.profileImage = profileImageUrl;
        if (req.body.childcategory) {
            let parsedChildCategory;
            try {
                parsedChildCategory = JSON.parse(req.body.childcategory);
            }
            catch (e) {
                return res.status(400).json({ message: 'Invalid childcategory format' });
            }
            if (Array.isArray(parsedChildCategory)) {
                updateFields.childcategory = parsedChildCategory.map((categoryId) => (categoryId));
            }
            else {
                return res.status(400).json({ message: 'childcategory should be an array' });
            }
        }
        const sitter = yield sitterModel_1.default.findByIdAndUpdate(sitterId, { $set: updateFields }, { new: true });
        if (!sitter) {
            return res.status(404).json({ message: 'Sitter not found' });
        }
        res.status(200).json({ message: 'Sitter updated successfully', sitter });
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
exports.editProfile = editProfile;
const getSlots = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        console.log(sitterId, 'sitter');
        const sitter = yield sitterModel_1.default.findById(sitterId);
        console.log(sitter, 'id');
        if (!sitter) {
            res.status(404).json({ message: "sitter not found" });
            return;
        }
        if (sitter.blocked === true) {
            res.status(403).json({ message: "Your account is blocked" });
            return;
        }
        if (sitter === null || sitter === void 0 ? void 0 : sitter.weekendSlots) {
            const slots = yield weekendsittingModel_1.default.find({ _id: { $in: sitter.weekendSlots } });
            console.log(slots);
            if (slots.length > 0) {
                res.status(200).json({ slots });
                return;
            }
        }
        if (sitter === null || sitter === void 0 ? void 0 : sitter.occasionalSlots) {
            const slots = yield occasionalsittingModel_1.default.find({ _id: { $in: sitter.occasionalSlots } });
            if (slots.length > 0) {
                res.status(200).json({ slots });
                return;
            }
        }
        if (sitter === null || sitter === void 0 ? void 0 : sitter.specialCareSlots) {
            const slots = yield specialcareModel_1.default.find({ _id: { $in: sitter.specialCareSlots } });
            if (slots.length > 0) {
                res.status(200).json({ slots });
                return;
            }
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
exports.getSlots = getSlots;
const geteditSlot = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId, slotId } = req.params;
        let slotid = new mongoose_1.default.Types.ObjectId(slotId);
        const sitter = yield sitterModel_1.default.findById(sitterId);
        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' });
        }
        if ((sitter === null || sitter === void 0 ? void 0 : sitter.blocked) === true) {
            res.status(403).json({ message: "Your account is blocked" });
            return;
        }
        let slot;
        if (sitter === null || sitter === void 0 ? void 0 : sitter.weekendSlots.includes(slotid)) {
            slot = yield weekendsittingModel_1.default.findById(slotid);
        }
        else if (sitter === null || sitter === void 0 ? void 0 : sitter.occasionalSlots.includes(slotid)) {
            slot = yield occasionalsittingModel_1.default.findById(slotid);
        }
        else if (sitter === null || sitter === void 0 ? void 0 : sitter.specialCareSlots.includes(slotid)) {
            slot = yield specialcareModel_1.default.findById(slotid);
        }
        if (!slot) {
            res.status(404).json({ message: 'Slot not found' });
            return;
        }
        res.status(200).json({ slot });
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
exports.geteditSlot = geteditSlot;
const editSlot = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        const { availableDates } = req.body;
        console.log(req.body, 'bodyyyyyy');
        const sitter = yield sitterModel_1.default.findById(sitterId);
        if (!sitter) {
            res.status(404).json({ message: 'Sitter not found' });
            return;
        }
        if ((sitter === null || sitter === void 0 ? void 0 : sitter.blocked) === true) {
            res.status(403).json({ message: 'Your account is blocked' });
            return;
        }
        let slotsUpdated = false;
        const formattedAvailableDates = availableDates.map(dateObj => {
            const date = new Date(dateObj.date);
            date.setUTCHours(0, 0, 0, 0);
            return {
                date,
                timeslots: dateObj.timeslots.map(slot => ({
                    startTime: new Date(slot.startTime),
                    endTime: new Date(slot.endTime)
                }))
            };
        });
        if ((sitter === null || sitter === void 0 ? void 0 : sitter.weekendSlots) && sitter.weekendSlots.length > 0) {
            yield weekendsittingModel_1.default.updateMany({ _id: { $in: sitter.weekendSlots } }, {
                $push: {
                    availableDates: { $each: formattedAvailableDates }
                }
            });
            slotsUpdated = true;
        }
        if ((sitter === null || sitter === void 0 ? void 0 : sitter.occasionalSlots) && sitter.occasionalSlots.length > 0) {
            yield occasionalsittingModel_1.default.updateMany({ _id: { $in: sitter.occasionalSlots } }, {
                $push: {
                    availableDates: { $each: formattedAvailableDates }
                }
            });
            slotsUpdated = true;
        }
        if ((sitter === null || sitter === void 0 ? void 0 : sitter.specialCareSlots) && sitter.specialCareSlots.length > 0) {
            yield specialcareModel_1.default.updateMany({ _id: { $in: sitter.specialCareSlots } }, {
                $push: {
                    availableDates: { $each: formattedAvailableDates }
                }
            });
            slotsUpdated = true;
        }
        if (slotsUpdated) {
            res.status(200).json({ message: 'Slots updated successfully', sitter });
            return;
        }
        else {
            res.status(200).json({ message: 'No slots were updated', sitter });
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
exports.editSlot = editSlot;
const getBabysitter = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const sitter = yield sitterModel_1.default.find({ selectedSittingOption: categoryId });
        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' });
            return;
        }
        console.log(sitter);
        res.status(200).json({ sitter });
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
exports.getBabysitter = getBabysitter;
const sitterLogout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('heyy');
        res.cookie('sitterjwt', '', {
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
exports.sitterLogout = sitterLogout;
const getSittingcategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sittingcategoryId } = req.params;
        const category = yield sittingcategoryModel_1.default.findById(sittingcategoryId);
        if (!category) {
            res.status(404).json({ message: 'sitting category dont find' });
            return;
        }
        res.status(200).json({ category });
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
exports.getSittingcategory = getSittingcategory;
const editTimeslot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId, slotId } = req.params;
        const { startTime, endTime } = req.body;
        const sitter = yield sitterModel_1.default.findById(sitterId);
        if (!sitter) {
            return res.status(404).json({ message: 'Sitter not found' });
        }
        if (sitter.blocked === true) {
            res.status(403).json({ message: "Your account is blocked" });
            return;
        }
        if (sitter === null || sitter === void 0 ? void 0 : sitter.weekendSlots) {
            const weekendSlots = yield weekendsittingModel_1.default.findOne({ _id: { $in: sitter.weekendSlots } });
            if (weekendSlots) {
                const timeslot = weekendSlots.availableDates.find(date => date.timeslots.some(slot => slot._id.toString() === slotId));
                if (timeslot) {
                    if (startTime) {
                        timeslot.timeslots.forEach(slot => {
                            if (slot._id.toString() === slotId) {
                                slot.startTime = startTime;
                            }
                        });
                    }
                    if (endTime) {
                        timeslot.timeslots.forEach(slot => {
                            if (slot._id.toString() === slotId) {
                                slot.endTime = endTime;
                            }
                        });
                    }
                    yield weekendSlots.save();
                    res.status(200).json({ message: 'Timeslot updated successfully', timeslot });
                    return;
                }
            }
        }
        if (sitter === null || sitter === void 0 ? void 0 : sitter.occasionalSlots) {
            const occasionalSlots = yield occasionalsittingModel_1.default.findOne({ _id: { $in: sitter.occasionalSlots } });
            if (occasionalSlots) {
                const timeslot = occasionalSlots.availableDates.find(date => date.timeslots.some(slot => slot._id.toString() === slotId));
                if (timeslot) {
                    if (startTime) {
                        timeslot.timeslots.forEach(slot => {
                            if (slot._id.toString() === slotId) {
                                slot.startTime = startTime;
                            }
                        });
                    }
                    if (endTime) {
                        timeslot.timeslots.forEach(slot => {
                            if (slot._id.toString() === slotId) {
                                slot.endTime = endTime;
                            }
                        });
                    }
                    yield occasionalSlots.save();
                    res.status(200).json({ message: 'Timeslot updated successfully', timeslot });
                    return;
                }
            }
        }
        if (sitter === null || sitter === void 0 ? void 0 : sitter.specialCareSlots) {
            const specialSlots = yield specialcareModel_1.default.findOne({ _id: { $in: sitter.specialCareSlots } });
            if (specialSlots) {
                const timeslot = specialSlots.availableDates.find(date => date.timeslots.some(slot => slot._id.toString() === slotId));
                if (timeslot) {
                    if (startTime) {
                        timeslot.timeslots.forEach(slot => {
                            if (slot._id.toString() === slotId) {
                                slot.startTime = startTime;
                            }
                        });
                    }
                    if (endTime) {
                        timeslot.timeslots.forEach(slot => {
                            if (slot._id.toString() === slotId) {
                                slot.endTime = endTime;
                            }
                        });
                    }
                    yield specialSlots.save();
                    res.status(200).json({ message: 'Timeslot updated successfully', timeslot });
                    return;
                }
            }
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
});
exports.editTimeslot = editTimeslot;
const bookingsList = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        const sitter = yield sitterModel_1.default.findById(sitterId);
        if ((sitter === null || sitter === void 0 ? void 0 : sitter.blocked) === true) {
            res.status(403).json({ message: 'Your account is blocked' });
            return;
        }
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const totalCount = yield bookingModel_1.default.countDocuments({ sitter: sitterId });
        const findBookings = yield bookingModel_1.default.find({ sitter: sitterId })
            .populate({
            path: 'parent',
            select: '-password',
        })
            .skip(skip)
            .limit(limit);
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
exports.bookingsList = bookingsList;
const createChat = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId, parentId } = req.body;
        const sitter = yield sitterModel_1.default.findById(sitterId);
        if ((sitter === null || sitter === void 0 ? void 0 : sitter.blocked) === true) {
            res.status(403).json({ message: "Your account is blocked" });
            return;
        }
        let chat = yield chatModel_1.default.findOne({
            participants: { $all: [sitterId, parentId] }
        });
        if (!chat) {
            chat = new chatModel_1.default({
                participants: [sitterId, parentId],
                messages: []
            });
            yield chat.save();
        }
        console.log(chat, 'chat');
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
            AudioUrl: audioUrl || ''
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
const lastMsg = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.lastMsg = lastMsg;
const checkBlocked = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.query;
        console.log(sitterId);
        const sitter = yield sitterModel_1.default.findById({ _id: sitterId });
        console.log(sitter, 'kk');
        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' });
            return;
        }
        if (sitter.blocked) {
            console.log('bloced');
            res.status(200).json({ sitter, message: 'You are blocked' });
            return;
        }
        else {
            res.status(200).json({ sitter });
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
exports.checkBlocked = checkBlocked;
const getReview = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        if (!sitterId) {
            res.status(404).json({ message: 'sitterId is required' });
            return;
        }
        const review = yield reviewModel_1.default.find({ sitter: sitterId }).populate('parent');
        if (!review) {
            res.status(404).json({ message: 'No reviews found for the given sitterId' });
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
exports.getReview = getReview;
const lastSeen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        const updateSitter = yield sitterModel_1.default.findByIdAndUpdate(sitterId, {
            lastseen: new Date()
        }, {
            new: true
        });
        if (!updateSitter) {
            return res.status(404).json({ message: 'Parent not found' });
        }
        res.status(200).json({ lastseen: updateSitter.lastseen });
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
exports.lastSeen = lastSeen;
const getLastseen = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.query;
        const parent = yield parentModel_1.default.findById(parentId);
        if (!parent) {
            res.status(404).json({ message: 'parent not found' });
            return;
        }
        const lastseen = parent === null || parent === void 0 ? void 0 : parent.lastseen;
        res.status(200).json({ lastseen });
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
exports.getLastseen = getLastseen;
const postSeen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sitterId } = req.params;
        console.log(sitterId, 'id');
        const { chatId } = req.query;
        console.log(req.query.chatId, 'idss');
        if (!sitterId || !chatId) {
            return res.status(400).json({ message: 'sitterId and chatId are required' });
        }
        const unseenMessages = yield messageModel_1.default.find({
            chat: chatId,
            seenBy: { $ne: sitterId }
        });
        if (unseenMessages.length === 0) {
            return res.status(200).json({ message: 'No unseen messages' });
        }
        for (const message of unseenMessages) {
            message.seenBy.push(sitterId);
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
exports.postSeen = postSeen;
