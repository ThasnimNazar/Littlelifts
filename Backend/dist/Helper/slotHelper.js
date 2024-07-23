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
exports.checkAvailability = exports.createSpecialCareSittingSlot = exports.createOccasionalSittingSlot = exports.createWeekendSittingSlot = void 0;
const weekendsittingModel_1 = __importDefault(require("../Models/weekendsittingModel"));
const occasionalsittingModel_1 = __importDefault(require("../Models/occasionalsittingModel"));
const specialcareModel_1 = __importDefault(require("../Models/specialcareModel"));
const bookingModel_1 = __importDefault(require("../Models/bookingModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const createWeekendSittingSlot = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sittingCategoryId, sitterId, availableDates, offDates, }) {
    try {
        const newWeekendSittingSlot = new weekendsittingModel_1.default({
            sittingCategory: new mongoose_1.default.Types.ObjectId(sittingCategoryId),
            sitter: new mongoose_1.default.Types.ObjectId(sitterId),
            availableDates,
            offDates,
        });
        yield newWeekendSittingSlot.save();
        return {
            success: true,
            message: 'Weekend sitting slot created successfully',
            weekendSittingSlot: newWeekendSittingSlot,
        };
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error creating weekend sitting slot:', error.message);
            return {
                success: false,
                message: error.message,
            };
        }
        else {
            console.error('An unknown error occurred');
            return {
                success: false,
                message: 'An unknown error occurred',
            };
        }
    }
});
exports.createWeekendSittingSlot = createWeekendSittingSlot;
const createSpecialCareSittingSlot = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sittingCategoryId, sitterId, availableDates, offDates, }) {
    try {
        const newSpecialCareSittingSlot = new specialcareModel_1.default({
            sittingCategory: new mongoose_1.default.Types.ObjectId(sittingCategoryId),
            sitter: new mongoose_1.default.Types.ObjectId(sitterId),
            availableDates,
            offDates,
        });
        yield newSpecialCareSittingSlot.save();
        return {
            success: true,
            message: 'Special care sitting slot created successfully',
            specialCareSittingSlot: newSpecialCareSittingSlot,
        };
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error creating special care sitting slot:', error.message);
            return {
                success: false,
                message: error.message,
            };
        }
        else {
            console.error('An unknown error occurred');
            return {
                success: false,
                message: 'An unknown error occurred',
            };
        }
    }
});
exports.createSpecialCareSittingSlot = createSpecialCareSittingSlot;
const createOccasionalSittingSlot = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sittingCategoryId, sitterId, availableDates, offDates, }) {
    try {
        const newOccasionalSittingSlot = new occasionalsittingModel_1.default({
            sittingCategory: new mongoose_1.default.Types.ObjectId(sittingCategoryId),
            sitter: new mongoose_1.default.Types.ObjectId(sitterId),
            availableDates,
            offDates,
        });
        yield newOccasionalSittingSlot.save();
        return {
            success: true,
            message: 'Occasional sitting slot created successfully',
            occasionalSittingSlot: newOccasionalSittingSlot,
        };
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error creating occasional sitting slot:', error.message);
            return {
                success: false,
                message: error.message,
            };
        }
        else {
            console.error('An unknown error occurred');
            return {
                success: false,
                message: 'An unknown error occurred',
            };
        }
    }
});
exports.createOccasionalSittingSlot = createOccasionalSittingSlot;
const checkAvailability = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sitterId, selectedDate, startTime, endTime, }) {
    try {
        const existingBooking = yield bookingModel_1.default.findOne({
            sitter: sitterId,
            selectedDate: selectedDate,
            'timeSlot.startTime': { $lt: endTime },
            'timeSlot.endTime': { $gt: startTime },
            status: { $ne: 'Cancelled' },
        });
        if (existingBooking) {
            return { success: false, message: 'Time slot is not available' };
        }
        return { success: true, message: 'Time slot is available' };
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error checking slot availability:', error.message);
            return { success: false, message: error.message };
        }
        else {
            console.error('An unknown error occurred');
            return { success: false, message: 'An unknown error occurred' };
        }
    }
});
exports.checkAvailability = checkAvailability;
