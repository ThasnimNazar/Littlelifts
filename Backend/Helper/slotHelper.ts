import RegularSitting from "../Models/regularsittingModel";
import WeekendSitting from "../Models/weekendsittingModel";
import OccasionalSitting from "../Models/occasionalsittingModel";
import SpecialCareSitting from "../Models/specialcareModel";
import Booking from "../Models/bookingModel";

import mongoose from "mongoose";
import { Types } from "mongoose";



interface AvailableDate {
    date: Date;
    timeslots: {
        startTime: Date;
        endTime: Date;
    }[];
}


interface CreateWeekendSittingSlotInput {
    sittingCategoryId: string;
    sitterId: string;
    availableDates: AvailableDate[];
    offDates: Date[];
}

interface CreateSpecialCareSittingSlotInput {
    sittingCategoryId: string;
    sitterId: string;
    availableDates: AvailableDate[];
    offDates: Date[];
}

interface CreateOccasionalSittingSlotInput {
    sittingCategoryId: string;
    sitterId: string;
    availableDates: AvailableDate[];
    offDates: Date[];
}

interface SlotAvailability {
    sitterId: Types.ObjectId;
    selectedDate: Date;
    startTime: Date;
    endTime: Date;

}




const createWeekendSittingSlot = async ({
    sittingCategoryId,
    sitterId,
    availableDates,
    offDates,
}: CreateWeekendSittingSlotInput) => {
    try {
        const newWeekendSittingSlot = new WeekendSitting({
            sittingCategory: new mongoose.Types.ObjectId(sittingCategoryId),
            sitter: new mongoose.Types.ObjectId(sitterId),
            availableDates,
            offDates,
        });

        await newWeekendSittingSlot.save();

        return {
            success: true,
            message: 'Weekend sitting slot created successfully',
            weekendSittingSlot: newWeekendSittingSlot,
        };
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error creating weekend sitting slot:', error.message);
            return {
                success: false,
                message: error.message,
            };
        } else {
            console.error('An unknown error occurred');
            return {
                success: false,
                message: 'An unknown error occurred',
            };
        }
    }
};

const createSpecialCareSittingSlot = async ({
    sittingCategoryId,
    sitterId,
    availableDates,
    offDates,
}: CreateSpecialCareSittingSlotInput) => {
    try {
        const newSpecialCareSittingSlot = new SpecialCareSitting({
            sittingCategory: new mongoose.Types.ObjectId(sittingCategoryId),
            sitter: new mongoose.Types.ObjectId(sitterId),
            availableDates,
            offDates,
        });

        await newSpecialCareSittingSlot.save();

        return {
            success: true,
            message: 'Special care sitting slot created successfully',
            specialCareSittingSlot: newSpecialCareSittingSlot,
        };
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error creating special care sitting slot:', error.message);
            return {
                success: false,
                message: error.message,
            };
        } else {
            console.error('An unknown error occurred');
            return {
                success: false,
                message: 'An unknown error occurred',
            };
        }
    }
};




const createOccasionalSittingSlot = async ({
    sittingCategoryId,
    sitterId,
    availableDates,
    offDates,
}: CreateOccasionalSittingSlotInput) => {
    try {
        const newOccasionalSittingSlot = new OccasionalSitting({
            sittingCategory: new mongoose.Types.ObjectId(sittingCategoryId),
            sitter: new mongoose.Types.ObjectId(sitterId),
            availableDates,
            offDates,
        });

        await newOccasionalSittingSlot.save();

        return {
            success: true,
            message: 'Occasional sitting slot created successfully',
            occasionalSittingSlot: newOccasionalSittingSlot,
        };
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error creating occasional sitting slot:', error.message);
            return {
                success: false,
                message: error.message,
            };
        } else {
            console.error('An unknown error occurred');
            return {
                success: false,
                message: 'An unknown error occurred',
            };
        }
    }
};

const checkAvailability = async ({
    sitterId,
    selectedDate,
    startTime,
    endTime,
}: SlotAvailability): Promise<{ success: boolean; message: string }> => {
    try {
        const existingBooking = await Booking.findOne({
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
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error checking slot availability:', error.message);
            return { success: false, message: error.message };
        } else {
            console.error('An unknown error occurred');
            return { success: false, message: 'An unknown error occurred' };
        }
    }
};






export { createWeekendSittingSlot, createOccasionalSittingSlot, createSpecialCareSittingSlot,checkAvailability }