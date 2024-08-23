import mongoose, { Schema, Document, Types, model } from 'mongoose';

interface Notification extends Document {
    recepientId: Types.ObjectId;    
    recipientType: 'parent' | 'sitter'; 
    message: string;               
    link?: string;                
    read: boolean;                
    createdAt: Date; 
}              

const NotificationSchema = new Schema<Notification>({
    recepientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientType: {
        type: String,
        enum: ['parent', 'sitter'], 
        required: true  
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String, 
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = model<Notification>('Notification', NotificationSchema);

export default Notification;
