import { Request, Response, NextFunction } from "express";
import asyncHandler from 'express-async-handler'
import bcrypt from 'bcryptjs'
import mongoose, { Types } from 'mongoose';
import { promisify } from 'util';
import generateSitterToken from "../Utils/generatesitterToken";
import sendOTP from "../Helper/otpHelper";
import sitterOtp from '../Models/sitterotpmodel'
import Sittingcategory from "../Models/sittingcategoryModel";
import Sitter, { SitterDocument } from "../Models/sitterModel";
import {
    createOccasionalSittingSlot,
    createSpecialCareSittingSlot, createWeekendSittingSlot
} from '../Helper/slotHelper'
import Booking from '../Models/bookingModel'

import { uploadSingle, uploadMultiple, uploadChatImage, uploadFields } from '../Connections/upload'
import WeekendSitting from "../Models/weekendsittingModel";
import OccasionalSitting from "../Models/occasionalsittingModel";
import SpecialCareSitting from "../Models/specialcareModel";
import Chat from '../Models/chatModel'
import Message from "../Models/messageModel";
import Review from '../Models/reviewModel'
import Parent from '../Models/parentModel'

const uploadMultiplePromise = promisify(uploadMultiple);
const uploadSingleImagePromise = promisify(uploadSingle);



interface sitterregister1 {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneno: string;
    gender: string;
    location: {
        latitude: number;
        longitude: number;
    };
}

interface User {
    id?: Types.ObjectId;
    email: string;
}

interface OtpBody {
    otp: number;
    sitterId: string;
}

interface PasswordBody {
    password: string;
    confirmPassword: string;
}

interface UpdateData{
    chatId:string;
}



export interface SlotData {

}

interface AvailableDate {
    date: Date;
    timeslots: {
        startTime: Date;
        endTime: Date;
    }[];
}

interface WeekendSlotData {
    availableDates: AvailableDate[];
    offDates: Date[];
}
export interface RegularSlotData extends SlotData {
    startDate: Date;
    endDate: Date;
    startTime: Date;
    endTime: Date;
    offDates: Date[];
}

export interface OccasionalSlotData {
    availableDates: AvailableDate[];
    offDates: Date[];
}

export interface SpecialCareSlotData {
    availableDates: AvailableDate[];
    offDates: Date[];
}

interface TimeSlot {
    startTime: Date;
    endTime: Date;
}


interface EditProfile {
    name: string;
    email: string;
    phoneno: number;
    gender: 'male' | 'female';
    maxchildren: number;
    yearofexperience: number;
    servicepay: number;
    about: string;
    workwithpet: 'yes' | 'no';
    selectedSittingOptions: {
        category: mongoose.Types.ObjectId;
        optionType: 'Weekend Sitting' | 'Occasional Sitting' | 'Regular Sitting' | 'SpecialCare Sitting';
        optionId: mongoose.Types.ObjectId;
    }[];
}

interface LoginData {
    email: string;
    password: string;
}

interface VerifyOtpRequest extends Request {
    body: {
        sitterId: string;
        otp: string;
    };
}

interface CustomRequest<T = {}> extends Request {
    sitter?: SitterDocument;
    body: T;
}

interface ResendOtp {
    otp: number;
    sitterId: string;
}

interface ChatRequest {
    sitterId: string;
    parentId: string;
}

interface MessageBody {
    chatId: string;
    senderId: string;
    content: string;
}


const sitterregisterStep1 = asyncHandler(async (req: Request<{}, {}, sitterregister1>, res: Response): Promise<void> => {
    try {
        const { name, email, phoneno, password, confirmPassword, gender, location } = req.body;
        console.log(req.body, 'body')
        const sitterExist = await Sitter.findOne({ email });
        if (sitterExist) {
            res.status(400).json({ message: 'A user with this email already exists' });
            return;
        }

        const sitterExistWithPhone = await Sitter.findOne({ phoneno });
        if (sitterExistWithPhone) {
            res.status(400).json({ message: 'A user with this phone number already exists' });
            return;
        }


        if (password !== confirmPassword) {
            res.status(400).json({ message: 'password doesnt match' })
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10)

       
        const { latitude, longitude } = location;

        
       


        const sitter = new Sitter({
            name: name,
            email: email,
            password: hashedPassword,
            phoneno: phoneno,
            gender: gender,
            role:'sitter',
            location: {
                type: 'Point',
                coordinates: [longitude, latitude] 
            }

        })

        await sitter.save();
        await sendOTPVerificationEmail({ id: sitter._id as Types.ObjectId, email: sitter.email }, res);
        const token = generateSitterToken(res, sitter._id as Types.ObjectId)

        if (sitter) {
            res.status(200).json({ message: 'Registration successful', sitter: sitter,sitterToken:token });
        }
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
})

const sendOTPVerificationEmail = async ({ id, email }: User, res: Response): Promise<void> => {
    console.log('heyy')
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const sitterId = id;
        console.log(sitterId)

        const saltRounds = 10;
        const hashedOtp = await bcrypt.hash(otp, saltRounds);

        const newOtpModel = new sitterOtp({
            _id: sitterId,
            otp: hashedOtp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });

        console.log(newOtpModel, 'otp')

        await newOtpModel.save();

        await sendOTP(email, otp);
        console.log('OTP sent');
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while sending the OTP verification email' });
    }
};


const sitterverifyOtp = async (req: VerifyOtpRequest, res: Response): Promise<void> => {
    try {
        const { sitterId, otp } = req.body;

        if (!sitterId || !otp) {
            res.status(400).json({ message: 'Parent ID or OTP is required' });
            return;
        }

        const userId = new mongoose.Types.ObjectId(sitterId);

        const parentOtpVerifyRecords = await sitterOtp.find({ _id: userId });

        if (parentOtpVerifyRecords.length <= 0) {
            res.status(404).json({ message: "Account record doesn't exist or has already been verified" });
            return;
        }

        const { expiresAt, otp: hashedOtp } = parentOtpVerifyRecords[0];

        if (expiresAt.getTime() < Date.now()) {
            await sitterOtp.deleteMany({ _id: userId });
            res.status(400).json({ message: 'Code has expired, please request again' });
            return;
        }

        const validOtp = await bcrypt.compare(otp, hashedOtp);

        if (!validOtp) {
            res.status(400).json({ message: 'The provided code is invalid. Please check your inbox' });
            return;
        }

        const sitter = await Sitter.findById(userId);

        if (!sitter) {
            res.status(404).json({ message: 'Parent record not found' });
            return;
        }



        await sitter.updateOne({ _id: userId });

        await sitterOtp.deleteMany({ _id: userId });

        res.json({
            status: "verified",
            sitter
        });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};

const sitresendOtp = asyncHandler(async (req: CustomRequest<ResendOtp>, res: Response) => {
    if (!req.sitter) {
        res.status(401).json({ message: 'Sitter not authenticated' });
        return;
    }

    const sitterId = req.sitter._id;
    const email = req.sitter.email;


    if (!sitterId || !email) {
        res.status(400).json({ message: "No user Details" });
        return;
    } else {
        try {
            const deletionResult = await sitterOtp.deleteMany({ _id: sitterId });
            console.log("Deletion Result:", deletionResult);
        } catch (error) {
            res.status(500).json({ message: "Failed to delete user OTPs" });
        }
        sendOTPVerificationEmail({ id: sitterId, email }, res);
    }
});

const sitterforgotPassword = asyncHandler(async (req: Request<{ email: string }>, res: Response) => {
    try {
        const email = req.body.email;
        console.log(email, 'eeee')
        const sitter = await Sitter.findOne({ email })
        console.log(sitter)
        if (!sitter) {
            res.status(401).json({ message: 'User not found, User authentication failed, Please SignUp again' });
            return;
        } else {
            generateSitterToken(res, sitter._id as Types.ObjectId)
            sendOTPVerificationEmail(sitter, res)
        }
        res.status(200).json({ message: "otp send" })
    }
    catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
})

const sitterpasswordOtp = asyncHandler(async (req: CustomRequest<OtpBody>, res: Response): Promise<void> => {
    try {
        const { otp } = req.body;

        if (!req.sitter) {
            res.status(401).json({ message: 'Parent not authenticated' });
            return;
        }

        const sitterId = req.sitter._id;
        console.log(sitterId)

        if (!otp) {
            res.status(400).json({ message: 'Empty passwords are not allowed' });
            return;
        }

        const sitterOtpVerifyRecords = await sitterOtp.find({ _id: sitterId });
        if (sitterOtpVerifyRecords.length <= 0) {
            res.status(404).json({ message: 'Account record doesn\'t exist or it is already verified' });
            return;
        }

        const { expiresAt, otp: hashedOtp } = sitterOtpVerifyRecords[0];
        if (expiresAt.getTime() < Date.now()) {
            await sitterOtp.deleteMany({ _id: sitterId });
            res.status(400).json({ message: 'Code has expired, please request again' });
            return;
        }

        const validOtp = await bcrypt.compare(otp.toString(), hashedOtp);
        if (!validOtp) {
            res.status(500).json({ message: 'The code you provided is invalid. Please check your inbox' });
            return;
        }

        const sitter = await Sitter.findById(new mongoose.Types.ObjectId(sitterId));
        if (!sitter) {
            res.status(404).json({ message: 'Sitter not found' });
            return;
        }

        await sitter.updateOne({ _id: new mongoose.Types.ObjectId(sitterId) });
        await sitterOtp.deleteMany({ _id: sitterId });

        res.json({
            status: 'verified',
            Sitter
        });
    } catch (error) {
        res.status(500).json({
            status: 'Failed',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
});

const resetsitterPassword = asyncHandler(async (req: CustomRequest<PasswordBody>, res: Response) => {
    try {
        const newPassword = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        if (!newPassword || !confirmPassword) {
            res.status(400).json({ message: 'password and confirm password is required' })
            return;
        }

        if (newPassword !== confirmPassword) {
            res.status(400).json({ message: 'password doesnt match' })
            return;
        }
        if (!req.sitter) {
            res.status(401).json({ message: 'Parent not authenticated' });
            return;
        }

        const sitterId = req.sitter._id;
        const sitter = await Sitter.findById({_id:sitterId});

        if (!sitter) {
            res.status(404).json({ message: 'Parent not found' });
            return;
        }

        if (newPassword) {
            const hashedPassword: string = await bcrypt.hash(newPassword, 10)
            sitter.password = hashedPassword;
        }

        const updatedUserData = await sitter.save();
        res.status(200).json({ message: "password updated", updatedUserData })
    }
    catch (error) {
        res.status(500).json({
            status: 'Failed',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
})




const sitterregisterStep2 = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { sitterId } = req.params;
        const { yearofexperience, workwithpet, maxchildren, servicepay, about, selectedcategories } = req.body;
        console.log(req.body)

        const sitter = await Sitter.findOne({ _id: sitterId })
        const childCategoryIds = selectedcategories.map((id: string) => new mongoose.Types.ObjectId(id));
        if (!sitter) {
            res.status(404).json({ message: 'Sitter not found' });
            return;
        }
        sitter.yearofexperience = yearofexperience
        sitter.workwithpet = workwithpet
        sitter.maxchildren = maxchildren
        sitter.servicepay = servicepay
        sitter.childcategory = childCategoryIds;
        sitter.about = about

        const updatedSitter = await sitter.save()

        res.status(200).json({
            message: 'Sitter updated successfully',
            sitter: updatedSitter
        });

    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const sitterregisterStep3 = asyncHandler(async (req: Request<{ sitterId: string }>, res: Response) => {
    try {
        const { sitterId } = req.params;
        const { activities, more } = req.body;
        if (!activities || !more) {
            res.status(400).json({ message: 'atleast one activities or more skill required' })
        }
        console.log(req.body, 'ddd')
        const sitter = await Sitter.findById({ _id: sitterId })

        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' })
            return
        }

        sitter.activities = activities;
        sitter.more = more;
        const updatedSitter = await sitter.save()
        res.status(200).json({ message: 'skills added successfully', sitter: updatedSitter })
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})


const getsittingOptions = asyncHandler(async (req: Request, res: Response) => {
    try {

        const sittingOptions = await Sittingcategory.find({});
        res.status(200).json(sittingOptions)
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const saveSittingOption = async (req: Request<{ sitterId: string }, {}, { selectedOption: string, selectedOptionId: string }>, res: Response) => {
    try {
        const { sitterId } = req.params;
        const { selectedOption, selectedOptionId } = req.body;

        if (!sitterId) {
            return res.status(400).json({ message: 'Sitter ID is required' });
        }

        if (!selectedOption || !selectedOptionId) {
            return res.status(400).json({ message: 'Selected option and option ID are required' });
        }

        const sitter = await Sitter.findById(sitterId);

        if (!sitter) {
            return res.status(404).json({ message: 'Sitter not found' });
        }

        sitter.selectedSittingOption = new mongoose.Types.ObjectId(selectedOptionId);
        await sitter.save();

        return res.status(200).json({ message: 'Selected sitting option saved successfully', sitter });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};







const manageSlots = async (
    req: Request<{ sitterId: string, selectedOptionId: string }, {}, { selectedOption: string, slotData: SlotData }>,
    res: Response
) => {
    try {
        const { sitterId, selectedOptionId } = req.params;
        const { selectedOption, slotData } = req.body;
        console.log(req.body, 'kk')

        if (!sitterId) {
            return res.status(400).json({ message: 'Sitter ID is required' });
        }

        if (!selectedOption || !selectedOptionId || !slotData) {
            return res.status(400).json({ message: 'Selected option, option ID, and slot data are required' });
        }

        const sitter: SitterDocument | null = await Sitter.findById(sitterId);

        if (!sitter) {
            return res.status(404).json({ message: 'Sitter not found' });
        }

        sitter.weekendSlots = [];
        sitter.occasionalSlots = [];
        sitter.specialCareSlots = [];

        let result;
        let createdSlotId: mongoose.Types.ObjectId | undefined;

        switch (selectedOption) {
            case 'Weekend Sitting':
                result = await createWeekendSittingSlot({
                    sittingCategoryId: selectedOptionId,
                    sitterId,
                    ...slotData as WeekendSlotData
                });
                createdSlotId = result.weekendSittingSlot?._id as mongoose.Types.ObjectId;;
                if (createdSlotId) sitter.weekendSlots.push(createdSlotId);
                break;
            case 'Occasional Sitting':
                result = await createOccasionalSittingSlot({
                    sittingCategoryId: selectedOptionId,
                    sitterId,
                    ...slotData as OccasionalSlotData
                });
                createdSlotId = result.occasionalSittingSlot?._id as mongoose.Types.ObjectId;;
                if (createdSlotId) sitter.occasionalSlots.push(createdSlotId);
                break;
            case 'Specialcare Sitting':
                result = await createSpecialCareSittingSlot({
                    sittingCategoryId: selectedOptionId,
                    sitterId,
                    ...slotData as SpecialCareSlotData
                });
                createdSlotId = result.specialCareSittingSlot?._id as mongoose.Types.ObjectId;;
                if (createdSlotId) sitter.specialCareSlots.push(createdSlotId);
                break;
            default:
                return res.status(400).json({ message: 'Invalid sitting option' });
        }

        if (result.success) {
            await sitter.save();
            return res.status(200).json({ message: 'Slots managed successfully', sitter });
        } else {
            return res.status(500).json({ message: result.message });
        }
    } catch (error) {
        console.error(error instanceof Error ? error.message : 'An unknown error occurred');
        res.status(500).json({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
};

const uploadVerificationDocuments = async (req: Request, res: Response) => {
    console.log('hello')
    try {
        await uploadMultiplePromise(req, res);
        const { sitterId } = req.params;
        const verificationDocsUrls = (req.files as any).map((file: any) => file.location);

        const sitter = await Sitter.findByIdAndUpdate(
            sitterId,
            { $push: { verificationDocuments: { $each: verificationDocsUrls } } },
            { new: true }
        ).select('-password -verificationDocuments');


        if (!sitter) {
            return res.status(404).json({ error: 'Sitter not found' });
        }

        res.status(200).json(sitter);
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
};




const getStatus = asyncHandler(async (req: Request<{ sitterId: string }>, res: Response) => {
    try {
        const { sitterId } = req.params;
        const sitter = await Sitter.findById({ _id: sitterId }).select('-password -verificationDocuments');

        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' })
            return
        }

        res.status(200).json({ sitter })
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const getsitterProfile = asyncHandler(async (req: Request<{ sitterId: string }>, res: Response) => {
    try {

        const { sitterId } = req.params;
        const sitter = await Sitter.findById(sitterId)
        
        console.log(sitter)
        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' })
            return;
        }

        if(sitter?.blocked === true){
            res.status(403).json({message:'Your account is blocked'})
            return;
        }

        res.status(200).json({ sitter })

    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const sitterLogin = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log(req.body, 'hyy')

        if (!email || !password) {
            res.status(400).json({ message: "email and password required" })
            return;
        }

        const sitter = await Sitter.findOne({ email })
        console.log(sitter, 'hey')

        if (!sitter) {
            res.status(404).json({ message: "sitter not found" })
            return;
        }

        if(!sitter?.role){
            sitter.role = 'sitter'
            await sitter.save();
        }

        if(sitter.blocked === true){
            res.status(403).json({message:'Your account is blocked'})
            return;
        }

        if (sitter.verified === true) {
            const passwordMatch = await bcrypt.compare(password, sitter.password);

            if (!passwordMatch) {
                res.status(400).json({ message: 'Incorrect password' });
                return;
            }

            const token = generateSitterToken(res, sitter._id as Types.ObjectId);
            res.status(200).json({ sitter: sitter,sitterToken:token, message: 'Sitter logged in successfully' });
        }
        else {
            res.status(400).json({ message: "your profile is not verified,please verify to login" })
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})


const editProfile = async (req: Request<{ sitterId: string }>, res: Response) => {
    try {
        await uploadSingleImagePromise(req, res);

        const { sitterId } = req.params;

        const sitterBlock = await Sitter.findById(sitterId)
        if(sitterBlock?.blocked === true){
            res.status(403).json({message:'Your account is blocked'})
            return;
        }

        const profileImageUrl = req.file ? (req.file as any).location : undefined;
        console.log(profileImageUrl)

        const updateFields: any = {};

        if (req.body.name) updateFields.name = req.body.name;
        if (req.body.email) updateFields.email = req.body.email;
        if (req.body.phoneno) updateFields.phoneno = req.body.phoneno;
        if (req.body.gender) updateFields.gender = req.body.gender;
        if (req.body.workwithpet) updateFields.workwithpet = req.body.workwithpet;
        if (req.body.servicepay) updateFields.servicepay = req.body.servicepay;
        if (req.body.yearofexperience) updateFields.yearofexperience = req.body.yearofexperience;
        if (req.body.maxchildren) updateFields.maxchildren = req.body.maxchildren;
        if (req.body.about) updateFields.about = req.body.about;
        if (profileImageUrl) updateFields.profileImage = profileImageUrl;

        if (req.body.childcategory) {
            let parsedChildCategory;
            try {
                parsedChildCategory = JSON.parse(req.body.childcategory);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid childcategory format' });
            }

            if (Array.isArray(parsedChildCategory)) {
                updateFields.childcategory = parsedChildCategory.map((categoryId: string) =>
                    (categoryId)
                );
            } else {
                return res.status(400).json({ message: 'childcategory should be an array' });
            }
        }

        const sitter = await Sitter.findByIdAndUpdate(sitterId, { $set: updateFields }, { new: true });

        if (!sitter) {
            return res.status(404).json({ message: 'Sitter not found' });
        }

        res.status(200).json({ message: 'Sitter updated successfully', sitter });
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}


const getSlots = asyncHandler(async (req: Request<{ sitterId: string }>, res: Response) => {
    try {

        const { sitterId } = req.params;
        console.log(sitterId, 'sitter')

        const sitter = await Sitter.findById(sitterId)
        console.log(sitter, 'id')
        if (!sitter) {
            res.status(404).json({ message: "sitter not found" })
            return;
        }

        if(sitter.blocked === true){
            res.status(403).json({message:"Your account is blocked"})
            return;
        }

        if (sitter?.weekendSlots) {

            const slots = await WeekendSitting.find({ _id: { $in: sitter.weekendSlots } });
            console.log(slots)
            if (slots.length > 0) {
                res.status(200).json({ slots })
                return;
            }
        }


        if (sitter?.occasionalSlots) {
            const slots = await OccasionalSitting.find({ _id: { $in: sitter.occasionalSlots } });
            if (slots.length > 0) {
                res.status(200).json({ slots })
                return;
            }
        }


        if (sitter?.specialCareSlots) {
            const slots = await SpecialCareSitting.find({ _id: { $in: sitter.specialCareSlots } });
            if (slots.length > 0) {
                res.status(200).json({ slots })
                return;
            }
        }

    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const geteditSlot = asyncHandler(async (req: Request<{ sitterId: string, slotId: string }>, res: Response) => {
    try {

        const { sitterId, slotId } = req.params;

        let slotid = new mongoose.Types.ObjectId(slotId)

        const sitter = await Sitter.findById(sitterId)

        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' })
        }

        if(sitter?.blocked === true){
            res.status(403).json({message:"Your account is blocked"})
            return;
        }

        let slot;

        if (sitter?.weekendSlots.includes(slotid)) {
            slot = await WeekendSitting.findById(slotid);
        } else if (sitter?.occasionalSlots.includes(slotid)) {
            slot = await OccasionalSitting.findById(slotid);
        } else if (sitter?.specialCareSlots.includes(slotid)) {
            slot = await SpecialCareSitting.findById(slotid);
        }

        if (!slot) {
            res.status(404).json({ message: 'Slot not found' });
            return;
        }

        res.status(200).json({ slot })
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const editSlot = asyncHandler(async (req: Request<{ sitterId: string }>, res: Response) => {
    try {
        const { sitterId } = req.params;
        const { availableDates }: { availableDates: AvailableDate[] } = req.body;
        console.log(req.body, 'bodyyyyyy')

        const sitter = await Sitter.findById(sitterId);

        if (!sitter) {
            res.status(404).json({ message: 'Sitter not found' });
            return;
        }

        if(sitter?.blocked === true){
            res.status(403).json({message:'Your account is blocked'})
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


        if (sitter?.weekendSlots && sitter.weekendSlots.length > 0) {
            await WeekendSitting.updateMany(
                { _id: { $in: sitter.weekendSlots } },
                {
                    $push: {
                        availableDates: { $each: formattedAvailableDates }
                    }
                }
            );
            slotsUpdated = true;
        }

        if (sitter?.occasionalSlots && sitter.occasionalSlots.length > 0) {
            await OccasionalSitting.updateMany(
                { _id: { $in: sitter.occasionalSlots } },
                {
                    $push: {
                        availableDates: { $each: formattedAvailableDates }
                    }
                }
            );
            slotsUpdated = true;
        }

        if (sitter?.specialCareSlots && sitter.specialCareSlots.length > 0) {
            await SpecialCareSitting.updateMany(
                { _id: { $in: sitter.specialCareSlots } },
                {
                    $push: {
                        availableDates: { $each: formattedAvailableDates }
                    }
                }
            );
            slotsUpdated = true;
        }

        if (slotsUpdated) {
            res.status(200).json({ message: 'Slots updated successfully', sitter });
            return;
        } else {
            res.status(200).json({ message: 'No slots were updated', sitter });
            return;
        }

    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});




const getBabysitter = asyncHandler(async (req: Request<{ categoryId: string }>, res: Response) => {
    try {
        const { categoryId } = req.params;

        const sitter = await Sitter.find({ selectedSittingOption: categoryId });

        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' })
            return;
        }

        console.log(sitter)

        res.status(200).json({ sitter })
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }

})


const sitterLogout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('heyy')
        res.cookie('sitterjwt', '', {
            httpOnly: true,
            expires: new Date(0)
        })
        res.status(200).json({ message: 'logout user' })
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const getSittingcategory = asyncHandler(async (req: Request<{ sittingcategoryId: string }>, res: Response) => {
    try {

        const { sittingcategoryId } = req.params;
        const category = await Sittingcategory.findById(sittingcategoryId)

        if (!category) {
            res.status(404).json({ message: 'sitting category dont find' })
            return;
        }

        res.status(200).json({ category })

    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const editTimeslot = async (req: Request<{ sitterId: string; slotId: string }>, res: Response) => {
    try {
        const { sitterId, slotId } = req.params;
        const { startTime, endTime } = req.body;

        const sitter = await Sitter.findById(sitterId);
        if (!sitter) {
            return res.status(404).json({ message: 'Sitter not found' });
        }

        if(sitter.blocked === true){
            res.status(403).json({message:"Your account is blocked"})
            return;
        }

        if (sitter?.weekendSlots) {
            const weekendSlots = await WeekendSitting.findOne({ _id: { $in: sitter.weekendSlots } });
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

                    await weekendSlots.save();

                    res.status(200).json({ message: 'Timeslot updated successfully', timeslot });
                    return;
                }
            }
        }

        if (sitter?.occasionalSlots) {
            const occasionalSlots = await OccasionalSitting.findOne({ _id: { $in: sitter.occasionalSlots } });
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

                    await occasionalSlots.save();

                    res.status(200).json({ message: 'Timeslot updated successfully', timeslot });
                    return;
                }
            }
        }

        if (sitter?.specialCareSlots) {
            const specialSlots = await SpecialCareSitting.findOne({ _id: { $in: sitter.specialCareSlots } });
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

                    await specialSlots.save();

                    res.status(200).json({ message: 'Timeslot updated successfully', timeslot });
                    return;
                }
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}


const bookingsList = asyncHandler(async (req: Request<{ sitterId: string }>, res: Response) => {
    try {
        const { sitterId } = req.params;
        const sitter = await Sitter.findById(sitterId)

        if(sitter?.blocked === true){
            res.status(403).json({message:'Your account is blocked'})
            return;
        }

        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const skip = (page - 1) * limit;

        const totalCount = await Booking.countDocuments({ sitter: sitterId });
        const findBookings = await Booking.find({ sitter: sitterId })
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

        const totalPages = Math.ceil(totalCount / limit)
        console.log(totalPages, 'gg')
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

const createChat = asyncHandler(async (req: Request<{}, {}, ChatRequest>, res: Response) => {
    try {
        const { sitterId, parentId } = req.body;
        const sitter = await Sitter.findById(sitterId)

        if(sitter?.blocked === true){
            res.status(403).json({message:"Your account is blocked"})
            return;
        }

        let chat = await Chat.findOne({
            participants: { $all: [sitterId, parentId] }
        });

        if (!chat) {
            chat = new Chat({
                participants: [sitterId, parentId],
                messages: []
            });
            await chat.save();
        }
        console.log(chat, 'chat')

        res.status(201).json(chat);   
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const sendMessage = asyncHandler(async (req: Request, res: Response) => {
    try {
        await new Promise<void>((resolve, reject) => {
            uploadFields(req, res, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        const { chatId, senderId, content, timestamp } = req.body;
        console.log(req.body, 'jj')
        const imageUrl = req.files && (req.files as any).image ? (req.files as any).image[0].location : '';
        const videoUrl = req.files && (req.files as any).video ? (req.files as any).video[0].location : '';
        const audioUrl = req.files && (req.files as any).audio ? (req.files as any).audio[0].location : '';


        const message = new Message({
            chat: chatId,
            sender: senderId,
            content: content,
            timestamp: new Date(timestamp),
            ImageUrl: imageUrl || '',
            VideoUrl: videoUrl || '',
            AudioUrl: audioUrl || ''
        });

        await message.save();
        console.log(message, 'msg')

        await Chat.findByIdAndUpdate(
            chatId,
            {
                $push: { messages: message._id },
                lastMessage: content,
                lastMessageTimestamp: new Date(timestamp)
            },
            { new: true }
        );
        res.status(200).json({ message })
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const getMessages = asyncHandler(async (req: Request<{ chatId: string }>, res: Response) => {
    try {
        const { chatId } = req.params;
        const messages = await Message.find({ chat: chatId }).sort({ timestamp: 1 });
        console.log(messages, 'mes')
        res.status(200).json({ messages });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const lastMsg = async(req:Request<{ chatId:string}>,res:Response)=>{
    try{
        const { chatId } = req.params;
        const chat = await Chat.findById(chatId).populate('lastMessage')
            .exec();
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.status(200).json({ chat })
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });  
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}

const checkBlocked = asyncHandler(async(req:Request,res:Response)=>{
    try{
       const { sitterId } = req.query;
       console.log(sitterId)
       const sitter = await Sitter.findById({ _id:sitterId})
       console.log(sitter,'kk')
       if(!sitter){
        res.status(404).json({message:'sitter not found'})   
        return;
       }

       if(sitter.blocked)
       {
        console.log('bloced')
        res.status(200).json({sitter,message:'You are blocked'})
        return;
       }
       else{
        res.status(200).json({sitter})
        return
       }     
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });  
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const getReview = asyncHandler(async(req:Request,res:Response)=>{
    try{
        const { sitterId }= req.params
        if(!sitterId){
            res.status(404).json({message:'sitterId is required'})
            return;
        }
        const review = await Review.find({sitter:sitterId}).populate('parent')

        if (!review) {
            res.status(404).json({ message: 'No reviews found for the given sitterId' })
            return;
        }

        res.status(200).json({review})
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });  
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    } 
})
    
const lastSeen = async(req:Request<{sitterId:string}>,res:Response)=>{
    try{

        const { sitterId } = req.params;

        const updateSitter = await Sitter.findByIdAndUpdate(
            sitterId,
            {
                lastseen:new Date()
            },
            {
                new:true
            }
        )

        if (!updateSitter) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        res.status(200).json({lastseen:updateSitter.lastseen})

    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });  
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    } 
}

const getLastseen = asyncHandler(async(req:Request,res:Response)=>{
    try{
        const { parentId } = req.query;
        const parent = await Parent.findById(parentId)
        if(!parent){
            res.status(404).json({message:'parent not found'})
            return
        }

        const lastseen = parent?.lastseen
        res.status(200).json({lastseen})

    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });  
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const postSeen = async(req:Request<{sitterId:string}>,res:Response)=>{
    try{
        const { sitterId } = req.params;
        console.log(sitterId,'id')
        const { chatId }= req.query;
        console.log(req.query.chatId,'idss')

        if (!sitterId || !chatId) {
            return res.status(400).json({ message: 'sitterId and chatId are required' });
        }

        const unseenMessages = await Message.find({
            chat: chatId,
            seenBy: { $ne: sitterId }  
        })

        if (unseenMessages.length === 0) {
            return res.status(200).json({ message: 'No unseen messages' });
          }
      
          for (const message of unseenMessages) {
            message.seenBy.push(sitterId);
            await message.save();  
          }
      
          res.status(200).json({ message: 'Messages marked as seen' });


    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
}



export {
    sitterregisterStep1, sitterregisterStep2, sitterregisterStep3, getsittingOptions,
    sitterLogout, saveSittingOption, manageSlots, uploadVerificationDocuments, getStatus, getsitterProfile,
    sitterverifyOtp, sitresendOtp, sitterforgotPassword, sitterpasswordOtp, resetsitterPassword, sitterLogin,
    editProfile, getSlots, getSittingcategory, geteditSlot, editSlot, getBabysitter, editTimeslot,
    bookingsList, createChat, sendMessage, getMessages, checkBlocked, getReview, lastSeen, getLastseen,lastMsg,
    postSeen

}