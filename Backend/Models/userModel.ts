import mongoose, { Schema, Document, Types } from 'mongoose';

interface User extends Document {
  userType: 'Parent' | 'Sitter'; 
  userId: Types.ObjectId; 
}

const userSchema = new Schema<User>({
  userType: { type: String, enum: ['Parent', 'Sitter'], required: true },
  userId: { type: Schema.Types.ObjectId, refPath: 'userType', required: true } // Dynamically reference Parent or Sitter
});

const User = mongoose.model<User>('User', userSchema);
export default User;
