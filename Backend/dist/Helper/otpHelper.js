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
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('thasni');
        console.log('email = ', email);
        console.log('otp = ', otp);
        console.log('user_email = ', process.env.USER_EMAIL);
        console.log('user_email = ', process.env.USER_PASSWORD);
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASSWORD,
            },
        });
        console.log(transporter);
        const mailOptions = {
            from: process.env.USER_EMAIL,
            to: email,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`,
        };
        console.log(mailOptions);
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        else {
            console.log('An unknown error occurred');
        }
    }
});
exports.default = sendOTP;
