import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import mongoose, { Types, Document } from 'mongoose';
import { promisify } from 'util';
import Parent, { ParentModel, ParentDocument } from '../Models/parentModel';
import parentOtp from '../Models/parentotpModel';
import generateParentToken from '../Utils/generateParentToken';
import Sitter from '../Models/sitterModel';
import sendOTP from '../Helper/otpHelper';
import { uploadSingle, uploadChatImage, uploadVideo, uploadFields } from '../Connections/upload'
import WeekendSitting from '../Models/weekendsittingModel';
import OccasionalSitting from '../Models/occasionalsittingModel';
import SpecialCareSitting from '../Models/specialcareModel';
import Childcategory from '../Models/childcategoryModel';
import Booking from '../Models/bookingModel'
import { weekendSitting } from '../Models/weekendsittingModel';
import { occasionalSitting } from '../Models/occasionalsittingModel'
import { AvailabelDates, TimeSlot, specialcareSitting } from '../Models/specialcareModel'
import Chat from '../Models/chatModel'
import Message from '../Models/messageModel'
import Review from '../Models/reviewModel'
import { getSocketIOInstance } from '../Connections/socket'
import Subscriptionplan from '../Models/subscriptionModel'
import Favourites from '../Models/favouritesModel';
import Usersubscription from '../Models/usersubscriptionModel';

const uploadSinglePromise = promisify(uploadSingle);
const uploadChatPromise = promisify(uploadChatImage);


interface ParentData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneno: number;
    noofchildrens: number;
    selectedchildcategory: string;
}

interface UpdateData{
 chatId:string;
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

interface ChatRequest {
    parentId: string;
    sitterId: string;
}

interface MessageBody {
    chatId: string;
    senderId: string;
    content: string;
    timestamp: string;
    imageUrl: string
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
            role: 'parent'
            
        });

        await parent.save();
        console.log(parent, 'pp');
        const role = parent.role;
        console.log(role,'role')

        await sendOTPVerificationEmail({ id: parent._id, email: parent.email }, res);

        const token = generateParentToken(res, parent._id);
        console.log(token,'kk')
        res.status(200).json({
            _id: parent._id,
            name,
            email,
            phoneno: phoneno,
            selectedchildcategory,
            parentToken:token,
            role
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

        if (parentExists.blocked) {
            res.status(401).json({ message: 'your account is blocked' })
            return;
        }

        const passwordMatch = await bcrypt.compare(password, parentExists.password);

        if (!passwordMatch) {
            res.status(400).json({ message: 'Incorrect password' });
            return;
        }

        const token = generateParentToken(res, parentExists._id);
        res.status(200).json({ parent: parentExists, message: 'Parent logged in successfully',parentToken:token,role:parentExists?.role });
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
        console.log('Received request for listing sitters');

        const page = parseInt(req.query.page as string, 10) || 1;
        const limit = parseInt(req.query.limit as string, 10) || 10;
        const skip = (page - 1) * limit;
        const lat = req.query.lat;
        const lng = req.query.lng;
        const radius = req.query.radius;

        if (!lat || !lng || !radius) {
            res.status(400).json({ message: 'Latitude, longitude, and radius are required.' });
            return;
        }

        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);
        const radiusInKm = parseFloat(radius as string);

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

        const babysitters = await Sitter.find(query);

        console.log('Babysitters found:', babysitters);

        const total = await Sitter.countDocuments(query);
        console.log('Total sitters found:', total);

        res.status(200).json({ sitters: babysitters, total });
    } catch (error) {
        console.error('Error while listing sitters:', error);
        res.status(500).json({ message: 'An unknown error occurred' });
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

const createChat = asyncHandler(async (req: Request<{}, {}, ChatRequest>, res: Response) => {
    try {
        const { parentId, sitterId } = req.body;
        let chat = await Chat.findOne({
            participants: { $all: [parentId, sitterId] }
        });

        if (!chat) {
            chat = new Chat({
                participants: [parentId, sitterId],
                messages: []
            });
            await chat.save();
        }

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


const sendMessage = asyncHandler(async (req: Request<{}, {}, MessageBody>, res: Response) => {
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
            AudioUrl: audioUrl || '',
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

const getLastmessage = async (req: Request<{ chatId: string }>, res: Response) => {
    try {
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

const markSeen = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { chatId, userId } = req.body;

        const io = getSocketIOInstance();
        await Message.updateMany(
            { chat: chatId, seenBy: { $ne: userId } },
            { $push: { seenBy: userId } }
        );

        res.status(200).json({ message: 'Messages marked as seen' });

        io.to(chatId).emit('messagesMarkedSeen', { userId });

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

const postReview = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { review, rating, bookingId } = req.body;
        console.log(req.body)

        const bookings = await Booking.findById(bookingId).populate('sitter parent');
        if (!bookings) {
            res.status(404).json({ message: 'booking not found' })
            return;
        }

        const newReview = new Review({
            booking: bookingId,
            sitter: bookings.sitter._id,
            parent: bookings.parent._id,
            rating: rating,
            comment: review
        })

        await newReview.save();

        bookings.reviewSubmitted = true;
        await bookings.save();

        res.status(200).json({ newReview })

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

const isBlocked = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { parentId } = req.query;
        const parent = await Parent.findById({ _id: parentId })
        if (!parent) {
            res.status(404).json({ message: 'parent not found' })
            return;
        }

        if (parent.blocked) {
            res.status(200).json({ parent, message: 'You are blocked' })
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

const getSubscription = asyncHandler(async (req: Request, res: Response) => {
    try {
        const subscription = await Subscriptionplan.find({})
        if (!subscription) {
            res.status(404).json({ message: 'subscription not found' })
            return;
        }

        res.status(200).json({ subscription })
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

const addFavourites = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { sitterId, parentId } = req.body;
        const sitter = await Sitter.findById(sitterId)
        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' })
            return;
        }

        const parent = await Parent.findById(parentId)
        if (!parent) {
            res.status(404).json({ message: 'Parent not found' })
            return;
        }

        const favourites = await Favourites.findOne({ parent: parentId })
        if (favourites) {
            if (favourites.sitters.includes(sitterId)) {
                res.status(400).json({ message: 'babysitter is already added to favourites' })
                return;
            }
            favourites.sitters.push(sitterId)
            await favourites.save();
            res.status(200).json({ message: 'babysitter addedd successfully' })
            return;

        }
        else {
            const newFavourites = new Favourites({
                sitters: [sitterId],
                parent: parentId
            })
            await newFavourites.save()
            console.log(newFavourites, 'fav')

            res.status(200).json({ message: "Added to favourites" })
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

const getFavourites = asyncHandler(async (req: Request<{ parentId: string }>, res: Response) => {
    try {
        const { parentId } = req.params;
        const favourites = await Favourites.findOne({ parent: parentId }).populate({ path: 'sitters', select: 'name email phoneno profileImage' })
            .set('strictPopulate', false);
        console.log(favourites, 'favs')
        if (!favourites) {
            res.status(400).json({ message: 'no favourites to display' })
            return;
        }

        res.status(200).json({ favourites })
        return;

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

const removeFavourites = asyncHandler(async (req: Request<{ parentId: string }>, res: Response) => {
    try {
        const { sitterId } = req.body;
        const { parentId } = req.params;
        const id = new mongoose.Types.ObjectId(parentId)
        const favourites = await Favourites.findOne({ parent: parentId })
        console.log(favourites, 'll')
        if (!favourites) {
            res.status(404).json({ message: 'fav sitters not found' })
            return;
        }

        if (!favourites?.sitters.includes(sitterId)) {
            res.status(404).json({ message: 'sitter not found in the favourites' })
            return;
        }

        (favourites.sitters as Types.Array<Types.ObjectId>).pull(sitterId);
        await favourites.save();
        res.status(200).json({ message: 'removed babysitters from favourites' })
        return;
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

const getUser = asyncHandler(async (req: Request<{ parentId: string }>, res: Response) => {
    try {
        const { parentId } = req.params;
        const userSubscription = await Usersubscription.findOne({ userId: parentId })
        console.log(userSubscription, 'uu')
        if (!userSubscription) {
            res.status(404).json({ message: 'subscription not found' })
            return;
        }

        res.status(200).json({ userSubscription })
        return;

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

const getReviews = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { sitterId } = req.params;
        console.log(sitterId)
        const review = await Review.find({ sitter: sitterId })
        if (!review) {
            res.status(404).json({ message: 'review not found' })
            return;
        }

        res.status(200).json({ review })
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

const updateLastseen = async (req: Request<{ parentId: string }>, res: Response) => {
    try {
        const { parentId } = req.params;

        const updateParent = await Parent.findByIdAndUpdate(
            parentId,
            {
                lastseen: new Date()
            },
            {
                new: true
            }
        )

        if (!updateParent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        res.status(200).json({ lastseen: updateParent.lastseen })
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

const lastSeen = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { sitterId } = req.query;
        console.log(sitterId, 'id')
        const sitter = await Sitter.findById(sitterId)
        if (!sitter) {
            res.status(404).json({ message: 'sitter not found' })
            return
        }

        const lastseen = sitter?.lastseen
        res.status(200).json(lastseen)

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

const getAllreviews = asyncHandler(async(req:Request,res:Response)=>{
    try{
      const reviews = await Review.find({}).populate({path:'parent',select:'profileImage name'})
      if(!reviews){
        res.status(400).json({message:"reviews not found"})
        return
      }

      res.status(200).json({reviews})
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

const updateSeen = async(req:Request<{parentId:string}>,res:Response)=>{
    try{
        const { chatId } = req.query;
        const { parentId } = req.params;
        console.log(parentId,'parentid-seen')
        console.log(chatId,'chatidddd')       

        if (!parentId || !chatId) {
            return res.status(400).json({ message: 'parentId and chatId are required' });
        }

        const unseenMessages = await Message.find({
            chat: chatId,      
            seenBy: { $ne: parentId }  
        })

       

        if (unseenMessages.length === 0) {
            return res.status(200).json({ message: 'No unseen messages' });
          }
      
          for (const message of unseenMessages) {
            message.seenBy.push(parentId);
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
    registerParent, parentLogin, listSitter, getProfile, editProfile, parentLogout, verifyOtp, forgotPassword, parentpasswordOtp,
    resetparentPassword, resendOtp, searchBabysitters, filterBabysittersByDate, getAvailabledates, getName, getSlots,
    bookingsParent, createChat, sendMessage, getMessages, markSeen, postReview, isBlocked, getSubscription, addFavourites, getFavourites,
    removeFavourites, getUser, getReviews, updateLastseen, lastSeen, getLastmessage,getAllreviews,updateSeen
};
