import mongoose, { Schema, Document, model } from 'mongoose';


interface OtpDocument extends Document {
    otp: string;
    createdAt: Date;
    expiresAt: Date;
}

const otpSchema = new Schema<OtpDocument>({
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
   
});

const parentOtp = model<OtpDocument>('parentOtp', otpSchema);
export default parentOtp;