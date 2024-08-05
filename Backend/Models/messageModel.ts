import mongoose, { Schema, Document, Types } from 'mongoose';

interface Message extends Document {
  chat: Types.ObjectId;
  sender: Types.ObjectId; 
  content: string;
  timestamp: Date;
  ImageUrl:string;
  VideoUrl:string;
  AudioUrl:string;
  seenBy: string[];
}

const messageSchema = new Schema<Message>({
  chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: Schema.Types.ObjectId, required: true },
  content: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  ImageUrl: { type: String },
  VideoUrl:{ type:String },
  AudioUrl:{type:String },
  seenBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }]

});

const Message = mongoose.model<Message>('Message', messageSchema);
export default Message;
