import mongoose, { Schema, Document, model, Types } from 'mongoose';

interface Review extends Document {
    booking: Types.ObjectId;
    sitter: Types.ObjectId;
    parent: Types.ObjectId;
    rating: number;
    comment: string;
}

const reviewSchema = new Schema<Review>({
    booking: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    sitter: {
        type: Schema.Types.ObjectId,
        ref: 'Sitter',
        required: true
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Parent',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Review = model<Review>('Review', reviewSchema);

export type ReviewDocument = Review & { _id: Types.ObjectId };

export default Review;
