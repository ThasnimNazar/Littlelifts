import mongoose, { Schema, Document , Types} from 'mongoose';


export interface occasionalSitting extends Document {
    sittingCategory: Types.ObjectId;
    sitter: Types.ObjectId;
    availableDates: AvailabelDates[];
    offDates: Date[];
}

export interface TimeSlot {
    startTime: Date;
    endTime: Date;
    _id:Types.ObjectId;
    bookingStatus?: 'approved' | 'pending' | 'rejected';

}

export interface AvailabelDates{
    date:Date;
    timeslots:TimeSlot[]
}

const timeSlotSchema = new mongoose.Schema<TimeSlot>({
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    bookingStatus: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'pending' }

})

const Availabledatesschema = new mongoose.Schema<AvailabelDates>({
    date:{
       type:Date
    },
    timeslots:[timeSlotSchema]
})


const occasionalSittingSchema = new Schema<occasionalSitting>({

    sittingCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Sittingcategory',
        required: true
    },
    sitter: {
        type: Schema.Types.ObjectId,
        ref: 'Sitter',
        required: true
    },
    availableDates:[Availabledatesschema],
    offDates: {
        type: [Date],
        required: true
    },
});




const OccasionalSitting = mongoose.model<occasionalSitting>('OccasionalSitting', occasionalSittingSchema);
export default OccasionalSitting