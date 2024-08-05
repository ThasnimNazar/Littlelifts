import mongoose, { Schema, Document, Types } from 'mongoose';

interface Chat extends Document {
  participants: Types.ObjectId[]; 
  messages: Types.ObjectId[]; 
}

const chatSchema = new Schema<Chat>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }], 
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }] 
});

const Chat = mongoose.model<Chat>('Chat', chatSchema);
export default Chat;
