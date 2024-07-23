import mongoose, { Schema, Document, Types } from 'mongoose';

interface RegularSitting extends Document {
    sittingCategory: Types.ObjectId;
    sitter: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    startTime: Date;
    endTime: Date;
    offDates: Date[];
}

const regularSittingSchema = new Schema<RegularSitting>({
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
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true,
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    offDates: {
        type: [Date],
        required: true
    },
});

const RegularSitting = mongoose.model<RegularSitting>('RegularSitting', regularSittingSchema);
export default RegularSitting;
