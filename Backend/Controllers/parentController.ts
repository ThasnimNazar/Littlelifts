import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import mongoose, { Types,Document } from 'mongoose';
import { promisify } from 'util';
import Parent, { ParentModel, ParentDocument } from '../Models/parentModel';
import parentOtp from '../Models/parentotpModel';
import generateParentToken from '../Utils/generateParentToken';
import Sitter from '../Models/sitterModel';
import sendOTP from '../Helper/otpHelper';
import { uploadSingle } from '../Connections/upload'
import WeekendSitting from '../Models/weekendsittingModel';
import OccasionalSitting from '../Models/occasionalsittingModel';
import SpecialCareSitting from '../Models/specialcareModel';
import Childcategory from '../Models/childcategoryModel';
import Booking from '../Models/bookingModel'
import { weekendSitting } from '../Models/weekendsittingModel';
import { occasionalSitting } from '../Models/occasionalsittingModel'
import {  AvailabelDates,TimeSlot,specialcareSitting } from '../Models/specialcareModel'

const uploadSinglePromise = promisify(uploadSingle);


interface ParentData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneno: number;
    noofchildrens: number;
    selectedchildcategory: string;
}

interface User {
    id?: Types.ObjectId;
    email: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface EditData {
    name: string;
    phoneno: number;
    profileImage: string;


}

interface VerifyOtpRequest extends Request {
    body: {
        parentId: string;
        otp: string;
    };
}

interface CustomRequest<T> extends Request {
    parent?: ParentDocument;
    body: T;
}//used for authentication purpose means to get extra info of the user,also for middlewares to access the user info

interface OtpBody {
    otp: number;
    parentId: string;
}

interface PasswordBody {
    password: string;
    confirmPassword: string;
}

interface CustomRequest<T = {}> extends Request {
    parent?: ParentDocument;
    body: T;
}



const registerParent = asyncHandler(async (req: Request<{}, {}, ParentData>, res: Response): Promise<void> => {
    try {
        const { name, email, phoneno, password, confirmPassword, selectedchildcategory } = req.body;
        console.log('request', req.body);

        if (password !== confirmPassword) {
            res.status(400).json({ message: 'Password doesn\'t match' });
            return;
        }

        const parentExist = await Parent.findOne({ email }) as (ParentModel & { _id: Types.ObjectId }) | null;

        if (parentExist) {
            res.status(400).json({ message: 'Parent already exists with the email' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const parent = new Parent({
            name,
            email,
            phoneno,
            password: hashedPassword,
            selectedchildcategory,
        });

        await parent.save();
        console.log(parent, 'pp');

        await sendOTPVerificationEmail({ id: parent._id, email: parent.email }, res);

        generateParentToken(res, parent._id);
        res.status(200).json({
            _id: parent._id,
            name,
            email,
            phoneno: phoneno,
            selectedchildcategory,
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

const sendOTPVerificationEmail = async ({ id, email }: User, res: Response): Promise<void> => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        const parentId = id;

        const saltRounds = 10;
        const hashedOtp = await bcrypt.hash(otp, saltRounds);

        const newOtpModel = new parentOtp({
            _id: parentId,
            otp: hashedOtp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });

        await newOtpModel.save();

        await sendOTP(email, otp);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
            return;
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
            return;
        }
    }
};

const verifyOtp = async (req: VerifyOtpRequest, res: Response): Promise<void> => {
    try {
        const { parentId, otp } = req.body;
        console.log(req.body)

        if (!parentId || !otp) {
            res.status(400).json({ message: 'Parent ID or OTP is required' });
            return;
        }

        const userId = new mongoose.Types.ObjectId(parentId);

        const parentOtpVerifyRecords = await parentOtp.find({ _id: userId });

        if (parentOtpVerifyRecords.length <= 0) {
            res.status(404).json({ message: "Account record doesn't exist or has already been verified" });
            return;
        }

        const { expiresAt, otp: hashedOtp } = parentOtpVerifyRecords[0];

        if (expiresAt.getTime() < Date.now()) {
            await parentOtp.deleteMany({ _id: userId });
            res.status(400).json({ message: 'Code has expired, please request again' });
            return;
        }

        const validOtp = await bcrypt.compare(otp, hashedOtp);

        if (!validOtp) {
            res.status(400).json({ message: 'The provided code is invalid. Please check your inbox' });
            return;
        }

        const parent = await Parent.findById(userId);

        if (!parent) {
            res.status(404).json({ message: 'Parent record not found' });
            return;
        }

        await parent.updateOne({ _id: userId });

        await parentOtp.deleteMany({ _id: userId });

        res.json({
            status: "verified",
            _id: parent._id,
            name: parent.name,
            email: parent.email,
            phoneno: parent.phoneno
        });
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
};

const resendOtp = asyncHandler(async (req: CustomRequest, res: Response) => {
    if (!req.parent) {
        res.status(401).json({ message: 'Parent not authenticated' });
        return;
    }

    const parentId = req.parent._id;
    const email = req.parent.email;


    if (!parentId || !email) {
        res.status(400).json({ message: "No user Details" });
    } else {
        try {
            const deletionResult = await parentOtp.deleteMany({ _id: parentId });
            console.log("Deletion Result:", deletionResult);
        } catch (error) {
            res.status(500).json({ message: "Failed to delete user OTPs" });
        }
        sendOTPVerificationEmail({ id: parentId, email }, res);
    }
});


const parentLogin = asyncHandler(async (req: Request<{}, {}, LoginData>, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email or password is required' });
            return;
        }

        const parentExists = await Parent.findOne({ email }) as (ParentModel & { _id: Types.ObjectId }) | null;

        if (!parentExists) {
            res.status(404).json({ message: 'Parent not found' });
            return;
        }

        const passwordMatch = await bcrypt.compare(password, parentExists.password);

        if (!passwordMatch) {
            res.status(400).json({ message: 'Incorrect password' });
            return;
        }

        generateParentToken(res, parentExists._id);
        res.status(200).json({ parent: parentExists, message: 'Parent logged in successfully' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

const listSitter = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const skip = (page - 1) * limit;

        const babysitters = await Sitter.find()
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({ sitters: babysitters });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
            return;
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
            return;
        }
    }
});


const getProfile = asyncHandler(async (req: Request<{ parentId: string }, {}>, res: Response): Promise<void> => {
    try {
        const { parentId } = req.params;
        const parent = await Parent.findById({ _id: parentId })
        if (parent) {
            res.status(200).json({ parent })
        }
        else {
            res.status(404).json({ message: 'failed to fetch parent details' })
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const editProfile = asyncHandler(async (req: Request<{ parentId: string }, {}, EditData>, res: Response): Promise<void> => {
    try {
        await uploadSinglePromise(req, res);
        const { parentId } = req.params;
        const { name, phoneno } = req.body;
        const profileImageUrl = (req.file as any).location;


        const updatedData: any = {};

        if (profileImageUrl) {
            updatedData.profileImage = profileImageUrl;
        }

        if (name) {
            updatedData.name = name;
        }

        if (phoneno) {
            updatedData.phoneno = phoneno;
        }

        const parent = await Parent.findByIdAndUpdate(
            parentId,
            { $set: updatedData },
            { new: true }
        ).select('-password');

        console.log(parent, 'll')

        if (!parent) {
            res.status(404).json({ error: 'Parent not found' });
            return;
        }

        res.status(200).json({ parent });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const parentLogout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('logout')
        res.cookie('parentjwt', '', {
            httpOnly: true,
            expires: new Date(0)
        })
        res.status(200).json({ message: 'logout user' })
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const forgotPassword = asyncHandler(async (req: Request<{ email: string }>, res: Response) => {
    try {
        const email = req.body.email;
        console.log(email, 'eeee')
        const parent = await Parent.findOne({ email })
        if (!parent) {
            res.status(401).json({ message: 'User not found, User authentication failed, Please SignUp again' });
            return;
        } else {
            generateParentToken(res, parent._id)
            sendOTPVerificationEmail(parent, res)
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

const parentpasswordOtp = asyncHandler(async (req: CustomRequest<OtpBody>, res: Response): Promise<void> => {
    try {
        const { otp } = req.body;

        if (!req.parent) {
            res.status(401).json({ message: 'Parent not authenticated' });
            return;
        }

        const parentId = req.parent._id;
        console.log(parentId)

        if (!otp) {
            res.status(400).json({ message: 'Empty passwords are not allowed' });
            return;
        }

        const parentOtpVerifyRecords = await parentOtp.find({ _id: parentId });
        if (parentOtpVerifyRecords.length <= 0) {
            res.status(404).json({ message: 'Account record doesn\'t exist or it is already verified' });
            return;
        }

        const { expiresAt, otp: hashedOtp } = parentOtpVerifyRecords[0];
        if (expiresAt.getTime() < Date.now()) {
            await parentOtp.deleteMany({ _id: parentId });
            res.status(400).json({ message: 'Code has expired, please request again' });
            return;
        }

        const validOtp = await bcrypt.compare(otp.toString(), hashedOtp);
        if (!validOtp) {
            res.status(500).json({ message: 'The code you provided is invalid. Please check your inbox' });
            return;
        }

        const parent = await Parent.findById(new mongoose.Types.ObjectId(parentId));
        if (!parent) {
            res.status(404).json({ message: 'Parent not found' });
            return;
        }

        await parent.updateOne({ _id: new mongoose.Types.ObjectId(parentId) });
        await parentOtp.deleteMany({ _id: parentId });

        res.json({
            status: 'verified',
            _id: parent._id,
            name: parent.name,
            email: parent.email,
            phoneNumber: parent.phoneno,
        });
    } catch (error) {
        res.status(500).json({
            status: 'Failed',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
});

const resetparentPassword = asyncHandler(async (req: CustomRequest<PasswordBody>, res: Response) => {
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
        if (!req.parent) {
            res.status(401).json({ message: 'Parent not authenticated' });
            return;
        }

        const parentId = req.parent._id;
        const parent = await Parent.findById(parentId);

        if (!parent) {
            res.status(404).json({ message: 'Parent not found' });
            return;
        }

        if (newPassword) {
            const hashedPassword: string = await bcrypt.hash(newPassword, 10)
            parent.password = hashedPassword;
        }

        const updatedUserData = await parent.save();
        res.status(200).json({ message: "password updated", updatedUserData })
    }
    catch (error) {
        res.status(500).json({
            status: 'Failed',
            message: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
})

const searchBabysitters = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { name, selectedSittingOption, childcategory } = req.query;
        console.log(req.query)

        let query: { [key: string]: any } = {};

        if (name) {
            query.name = { $regex: name, $options: 'i' }
        }

        if (selectedSittingOption) {
            query.selectedSittingOption = selectedSittingOption;
        }

        if (childcategory) {
            query.childcategory = childcategory;
        }

        const sitters = await Sitter.find(query).populate('Sittingcategory').populate('Category')
        console.log(sitters, 'hyy')
        res.status(200).json({ sitters })
        return;


    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const filterBabysittersByDate = async (req: Request, res: Response) => {
    const { selectedDate } = req.query;


    if (!selectedDate || typeof selectedDate !== 'string') {
        return res.status(400).json({ message: 'Invalid selectedDate parameter' });
    }

    try {
        const dateToFilter = new Date(selectedDate);
        dateToFilter.setUTCHours(0, 0, 0, 0);
        console.log(dateToFilter)

        const weekendSitters = await WeekendSitting.find({
            'availableDates.date': dateToFilter
        }).populate('sitter');

        console.log(weekendSitters, 'wee')

        const occasionalSitters = await OccasionalSitting.find({
            'availableDates.date': dateToFilter
        }).populate('sitter');

        const specialCareSitters = await SpecialCareSitting.find({
            'availableDates.date': dateToFilter
        }).populate('sitter');

        const allBabysitters = [
            ...weekendSitters.map(sitter => sitter.sitter),
            ...occasionalSitters.map(sitter => sitter.sitter),
            ...specialCareSitters.map(sitter => sitter.sitter)
        ];

        console.log(allBabysitters)

        res.status(200).json({ babysitters: allBabysitters });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getAvailabledates = async (req: Request<{ sitterId: string }>, res: Response) => {
    try {
        const { sitterId } = req.params;
        const sitter = await Sitter.findById(sitterId);

        if (!sitter) {
            return res.status(404).json({ message: 'Sitter not found' });
        }

        let availableDates: Date[] = [];
        let offDates: Date[] = [];

        if (sitter.weekendSlots && sitter.weekendSlots.length > 0) {
            const weekendSlots = await WeekendSitting.find({ _id: { $in: sitter.weekendSlots } });
            weekendSlots.forEach(slot => {
                slot.availableDates.forEach(dateSlot => {
                    availableDates.push(new Date(dateSlot.date));  // Accessing the date field
                });
                offDates = offDates.concat(slot.offDates || []);
            });
        }

        if (sitter.occasionalSlots && sitter.occasionalSlots.length > 0) {
            const occasionalSlots = await OccasionalSitting.find({ _id: { $in: sitter.occasionalSlots } });
            occasionalSlots.forEach(slot => {
                slot.availableDates.forEach(dateSlot => {
                    availableDates.push(new Date(dateSlot.date));
                });
                offDates = offDates.concat(slot.offDates || []);
            });
        }

        if (sitter.specialCareSlots && sitter.specialCareSlots.length > 0) {
            const specialCareSlots = await SpecialCareSitting.find({ _id: { $in: sitter.specialCareSlots } });
            specialCareSlots.forEach(slot => {
                slot.availableDates.forEach(dateSlot => {
                    availableDates.push(new Date(dateSlot.date));
                });
                offDates = offDates.concat(slot.offDates || []);
            });
        }

        res.status(200).json({ availableDates, offDates });

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

const getName = (async (req: Request, res: Response) => {
    try {
        console.log('heyy')
        const { ids } = req.body;
        console.log(req.body, 'bodyyyy')
        const childcategories = await Childcategory.find({ _id: { $in: ids } });
        console.log(childcategories, 'hehe')

        if (!childcategories) {
            return res.status(404).json({ message: 'Categories not found' });
        }

        const names = childcategories.map(category => category.name);

        res.status(200).json({ names });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

const getSlots = async (req: Request<{ sitterId: string }>, res: Response) => {
    try {
        const { sitterId } = req.params;
        console.log(sitterId, 'sitter');

        const sitter = await Sitter.findById(sitterId).exec();
        console.log(sitter, 'id');

        if (!sitter) {
            return res.status(404).json({ message: "Sitter not found" });
        }

        let slots: (weekendSitting | occasionalSitting | specialcareSitting)[] = [];

        if (sitter.weekendSlots && sitter.weekendSlots.length > 0) {
            slots = await WeekendSitting.find({ _id: { $in: sitter.weekendSlots } }).exec();
        } else if (sitter.occasionalSlots && sitter.occasionalSlots.length > 0) {
            slots = await OccasionalSitting.find({ _id: { $in: sitter.occasionalSlots } }).exec();
        } else if (sitter.specialCareSlots && sitter.specialCareSlots.length > 0) {
            slots = await SpecialCareSitting.find({ _id: { $in: sitter.specialCareSlots } }).exec();
        }

        const formattedSlots = slots.map(slot => {
            const slotObject = slot.toObject(); 
            return {
                ...slotObject,
                availableDates: (slotObject.availableDates as AvailabelDates[]).map(dateSlot => ({
                    ...dateSlot,
                    timeslots: (dateSlot.timeslots as TimeSlot[]).map(timeslot => ({
                        ...timeslot,
                        startTime: timeslot.startTime.toISOString(),
                        endTime: timeslot.endTime.toISOString(),
                        status: timeslot.bookingStatus === 'approved' ? 'unavailable' : timeslot.bookingStatus
                    }))
                }))
            };
        });

        res.status(200).json({ slots: formattedSlots });
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



const bookingsParent = asyncHandler(async (req: Request<{ parentId: string }>, res: Response) => {
    try {
        const { parentId } = req.params;
        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const skip = (page - 1) * limit;

        const totalCount = await Booking.countDocuments({ parent: parentId });
        const findBookings = await Booking.find({ parent: parentId })
            .populate({
                path: 'sitter',
                select: '-password',
            })
            .skip(skip)
            .limit(limit);

        console.log(findBookings, 'jjjjj')

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




export {
    registerParent, parentLogin, listSitter, getProfile, editProfile, parentLogout, verifyOtp, forgotPassword, parentpasswordOtp,
    resetparentPassword, resendOtp, searchBabysitters, filterBabysittersByDate, getAvailabledates, getName, getSlots,
    bookingsParent
};
