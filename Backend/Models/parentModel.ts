import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface ParentModel extends Document<Types.ObjectId>{
    name: string;
    email: string;
    password: string;
    phoneno: number;
    noofchildrens: number;
    selectedchildcategory: Types.ObjectId;
    profileImage:string;
    blocked:boolean;
    lastseen:Date;
    role:string;
    bookingCount:number;  
}

const parentSchema = new Schema<ParentModel>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneno: {
        type: Number,
        required: true,
    },
    selectedchildcategory: {
        type: Schema.Types.ObjectId,
        ref: 'Childcategory',
        required: true,
    },
    profileImage:{
        type:String
    },
    blocked:{
        type:Boolean,
        default:false
    },
    lastseen:{
        type:Date,
        default:Date.now()
    },
    role: { 
        type: String, 
        default: 'parent' 
    },
    bookingCount: { 
        type: Number, 
        default: 0 
    },
    
});

const Parent = model<ParentModel>('Parent', parentSchema);

export type ParentDocument =  ParentModel & { _id: Types.ObjectId };

export default Parent;
