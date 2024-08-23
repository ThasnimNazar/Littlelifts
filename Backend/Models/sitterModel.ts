import mongoose, { Schema, Document, model, Types } from 'mongoose';
import Childcategory from './childcategoryModel';

interface Sitter extends Document {
    name: string;
    email: string;
    password: string;
    phoneno: number;
    gender: 'male' | 'female';
    maxchildren: number;
    yearofexperience: number;
    servicepay: number;
    about: string;
    workwithpet: 'yes' | 'no';
    activities: ('Animations' | 'Help with homework' | 'Montessori' | 'Manual activities')[];
    more: ('Cooking' | 'Housework' | 'Gardening')[];
    childcategory: mongoose.Types.ObjectId[];
    selectedSittingOption: mongoose.Types.ObjectId | null;
    weekendSlots: mongoose.Types.ObjectId[];
    regularSlots: mongoose.Types.ObjectId[];
    occasionalSlots: mongoose.Types.ObjectId[];
    specialCareSlots: mongoose.Types.ObjectId[];
    verificationDocuments: string[]; 
    profileImage: string;
    verified:boolean;
    blocked:boolean;
    location: {
        type: 'Point';
        coordinates: [number, number]; 
    };
    lastseen:Date,
    role:string
}

const sitterSchema = new Schema<Sitter>({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    phoneno: {
        type: Number,
        unique: true
    },
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    yearofexperience: {
        type: Number,
    },
    workwithpet: {
        type: String,
        enum: ['yes', 'no']
    },
    activities: [{
        type: String,
        enum: ['Animations', 'Help with homework', 'Montessori', 'Manual activities'],
    }],
    more: [{
        type: String,
        enum: ['Cooking', 'Housework', 'Gardening']
    }],
    maxchildren: {
        type: Number,
    },
    servicepay: {
        type: Number,
    },
    about: {
        type: String,
    },
    childcategory:[{
      type:mongoose.Types.ObjectId,
      ref:'Childcategory',
    }],
    selectedSittingOption: {
        type: mongoose.Types.ObjectId,
        ref: 'Sittingcategory',
        default: null,
    },
    weekendSlots: [{
        type: Schema.Types.ObjectId,
        ref: 'WeekendSitting',
    }],
    
    occasionalSlots: [{
        type: Schema.Types.ObjectId,
        ref: 'OccasionalSitting',
    }],
    specialCareSlots: [{
        type: Schema.Types.ObjectId,
        ref: 'SpecialCareSitting',
    }],
    verificationDocuments: 
    [{ 
        type: String 
    }], 
    profileImage: 
    { 
        type: String 
    }, 
    verified:{
        type:Boolean,
        default:false
    },
    blocked:{
        type:Boolean,
        default:false
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    lastseen:{
        type:Date,
        default:Date.now()
    },
    role: { 
        type: String, 
        default: 'sitter' 
    },
    
}, 
{ timestamps: true });



sitterSchema.index({ location: '2dsphere' });

const Sitter = model<Sitter>('Sitter', sitterSchema);
export type SitterDocument =  Sitter & { _id: Types.ObjectId };


export default Sitter;
