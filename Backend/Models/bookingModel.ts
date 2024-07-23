import mongoose, { Schema, Document, model, Types } from 'mongoose';

interface Booking extends Document {
    sitter: Types.ObjectId;
    parent: Types.ObjectId;
    servicepay: string;
    selectedDate: Date;
    timeSlot: {
        startTime: Date;
        endTime: Date;
    };
    status: ('Pending' | 'Approved' | 'Cancelled')[];
    isPaid: boolean;
    rejectionReason: string;
    chargeId: string;
    sessionId: string;
    refundAmount: number;
    refundStatus: ("Pending" | "succeeded")[];


}

const bookingSchema = new Schema<Booking>({
    sitter: {
        type: Schema.Types.ObjectId,
        ref: 'Sitter',
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Parent',
    },
    servicepay: {
        type: String,
        required: true
    },
    selectedDate: {
        type: Date,
        required: true
    },
    timeSlot: {
        startTime: {
            type: Date,
        },
        endTime: {
            type: Date,
        }
    },
    status: [{
        type: String,
        enum: ['Pending', 'Approved', 'Cancelled'],
        required: true
    }],
    isPaid: {
        type: Boolean,
        required: true
    },
    rejectionReason: {
        type: String,
    },
    chargeId: {
        type: String,
    },
    sessionId: {
        type: String,
    },
    refundAmount: {
        type: Number,
    },
    refundStatus: {
        type: [String], 
        enum: ["Pending", "succeeded"],
        default: [] 
    }



}, { timestamps: true })

const Booking = model<Booking>('Booking', bookingSchema)
export type bookingDocument = Booking & { _id: Types.ObjectId };

export default Booking
