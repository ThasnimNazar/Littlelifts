import { Schema, model, Document, Types } from 'mongoose';

interface Admin extends Document {
  name: string;
  email: string;
  password: string;
}

const adminSchema = new Schema<Admin>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const Admin = model<Admin>('Admin', adminSchema);

export type AdminDocument = Admin & { _id: Types.ObjectId };

export default Admin;
