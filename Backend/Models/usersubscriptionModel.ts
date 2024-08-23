import mongoose, { Schema, Document, Types, model } from 'mongoose';

interface PaymentRecord {
    amount: number;
    date: Date;
    method: string;
}

interface UserSubscription {
    userId: Types.ObjectId;
    planId: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    status: ('Active' | 'Inactive' | 'Cancelled')[];
    credit: Number;
    sessionId: string;
    autoRenewal: boolean;
    paymentMethod: string;
    isPaid:boolean;
    paymentHistory: PaymentRecord[];
    createdAt: Date;
    updatedAt: Date;

}

const usersubscriptionSchema = new mongoose.Schema<UserSubscription>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Parent',
    },
    planId: {
        type: Schema.Types.ObjectId,
        ref: 'Subscriptionplan',
    },
    startDate: {
        type: Date,
        default: Date.now()
    },
    endDate: {
        type: Date,
        default: Date.now()
    },
    status: [{
        type: String,
        enum: ['Active', 'Inactive', 'Cancelled'],
        required: true
    }],
    credit: {
        type: Number,
    },
    autoRenewal: {
        type: Boolean,
    },
    sessionId: {
        type: String,
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentHistory: [{
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
        method: { type: String, required: true }
    }],
    isPaid:{
        type:Boolean
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }

})

const Usersubscription = model<UserSubscription>('Usersubscription',usersubscriptionSchema)
export type usersubscriptionModel = UserSubscription & { _id: Types.ObjectId };

export default Usersubscription