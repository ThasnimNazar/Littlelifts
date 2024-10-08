"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sitterController_1 = require("../Controllers/sitterController");
const authMiddleware_1 = require("../Middleware/authMiddleware");
const bookingController_1 = require("../Controllers/bookingController");
const categoryController_1 = require("../Controllers/categoryController");
const sitterroute = express_1.default.Router();
console.log(sitterroute, 'route');
sitterroute.post('/', sitterController_1.sitterregisterStep1);
sitterroute.post('/verifyotp', sitterController_1.sitterverifyOtp);
sitterroute.post('/resendotp', authMiddleware_1.protectSitter, sitterController_1.sitresendOtp);
sitterroute.post('/forget-password', sitterController_1.sitterforgotPassword);
sitterroute.post('/verify-passwordotp', authMiddleware_1.protectSitter, sitterController_1.sitterpasswordOtp);
sitterroute.post('/reset-password', authMiddleware_1.protectSitter, sitterController_1.resetsitterPassword);
sitterroute.put('/register-step2/:sitterId', sitterController_1.sitterregisterStep2);
sitterroute.put('/register-step3/:sitterId', sitterController_1.sitterregisterStep3);
sitterroute.get('/get-sittingopt', sitterController_1.getsittingOptions);
sitterroute.get('/get-childcategory', categoryController_1.getAllchildCategory);
sitterroute.get('/get-sittingcategory', categoryController_1.getAllsittingCategory);
sitterroute.put('/save-sittingoption/:sitterId', sitterController_1.saveSittingOption);
sitterroute.put('/slot-manage/:sitterId/:selectedOptionId', sitterController_1.manageSlots);
sitterroute.put('/upload-doc/:sitterId', sitterController_1.uploadVerificationDocuments);
sitterroute.get('/getstatus/:sitterId', sitterController_1.getStatus);
sitterroute.post('/login', sitterController_1.sitterLogin);
sitterroute.post('/logout', sitterController_1.sitterLogout);
sitterroute.get('/getprofile/:sitterId', authMiddleware_1.protectSitter, sitterController_1.getsitterProfile); //authentication middleware have to add
sitterroute.put('/editprofile/:sitterId', authMiddleware_1.protectSitter, sitterController_1.editProfile);
sitterroute.get('/getnames', authMiddleware_1.protectSitter, categoryController_1.getName);
sitterroute.get('/get-slots/:sitterId', authMiddleware_1.protectSitter, sitterController_1.getSlots);
sitterroute.get('/get-sittingcategory/:sittingcategoryId', sitterController_1.getSittingcategory);
sitterroute.get('/get-editslots/:sitterId/:slotId', authMiddleware_1.protectSitter, sitterController_1.geteditSlot);
sitterroute.put('/edit-slot/:sitterId', authMiddleware_1.protectSitter, sitterController_1.editSlot);
sitterroute.put('/edit-timeslots/:slotId/:sitterId', authMiddleware_1.protectSitter, sitterController_1.editTimeslot);
sitterroute.get('/get-sitter/:categoryId', sitterController_1.getBabysitter);
sitterroute.get('/bookings/:sitterId', authMiddleware_1.protectSitter, sitterController_1.bookingsList);
sitterroute.post('/approve-booking/:bookingId', authMiddleware_1.protectSitter, bookingController_1.bookingApproval);
sitterroute.post('/reject-booking/:bookingId', authMiddleware_1.protectSitter, bookingController_1.bookingRejection);
sitterroute.post('/webhook', bookingController_1.handleStripeWebhook);
sitterroute.get('/booked-parents/:sitterId', authMiddleware_1.protectSitter, bookingController_1.getBookedparents);
sitterroute.post('/createchat', authMiddleware_1.protectSitter, sitterController_1.createChat);
sitterroute.get('/get-messages/:chatId', authMiddleware_1.protectSitter, sitterController_1.getMessages);
sitterroute.post('/send-message', authMiddleware_1.protectSitter, sitterController_1.sendMessage);
// sitterroute.post('/mark-seen',protectSitter,markSeen)
sitterroute.get('/check-block', authMiddleware_1.protectSitter, sitterController_1.checkBlocked);
sitterroute.get('/get-reviews/:sitterId', authMiddleware_1.protectSitter, sitterController_1.getReview);
sitterroute.post('/last-seen/:sitterId', authMiddleware_1.protectSitter, sitterController_1.lastSeen);
sitterroute.get('/get-lastseen', authMiddleware_1.protectSitter, sitterController_1.getLastseen);
sitterroute.get('/get-lastmsg', authMiddleware_1.protectSitter, sitterController_1.lastMsg);
sitterroute.put('/post-lastseen/:sitterId', authMiddleware_1.protectSitter, sitterController_1.postSeen);
exports.default = sitterroute;
