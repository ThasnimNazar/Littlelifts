import mongoose, { Schema, Document ,Types} from 'mongoose';

interface Wallet{
    parentId: mongoose.Types.ObjectId;
    balance: number;
}

const walletSchema: Schema = new Schema({
    parentId: { type: mongoose.Types.ObjectId, required: true, ref: 'Parent' },
    balance: { type: Number, required: true, default: 0 },
});


const Wallet = mongoose.model<Wallet>('Wallet', walletSchema);

export default Wallet;

