import mongoose, { Schema, Document, Types } from 'mongoose';

interface Chat extends Document {
  participants: Types.ObjectId[]; 
  messages: Types.ObjectId[]; 
  lastMessage: string; 
  lastMessageTimestamp: Date;
}

const chatSchema = new Schema<Chat>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }], 
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  lastMessage: { type: String, default: '' },
  lastMessageTimestamp: { type: Date, default: null } 
});

const Chat = mongoose.model<Chat>('Chat', chatSchema);
export default Chat;
