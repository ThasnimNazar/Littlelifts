import mongoose, { Schema, Document ,Types, model} from 'mongoose';

interface SubscriptionModel extends Document{
    name:string;
    price:number;
    features:string[];
    billingcycle:string;
    maxcredits:number;
    description:string;
    isActive:boolean;
    createdAt:Date;
    updatedAt:Date;
}

const subscriptionPlanSchema = new mongoose.Schema<SubscriptionModel>({
   name:{
    type:String,
    required:true
   },
   price:{
    type:Number,
    required:true
   },
   features:{
    type:[String],
    required:true
   },
   billingcycle:{
    type:String,
    required:true
   },
   isActive:{
    type:Boolean,
    default:false
   },
   description:{
    type:String,
    required:true
   },
   createdAt:{
    type:Date,
    default:Date.now()
   },
   updatedAt:{
    type:Date,
    default:Date.now()
   }
})

const Subscriptionplan = model<SubscriptionModel>('Subscriptionplan', subscriptionPlanSchema);
export type Subscriptionmodel =  SubscriptionModel & { _id: Types.ObjectId };


export default Subscriptionplan;