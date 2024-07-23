import { Schema, model, Document } from 'mongoose';


interface childcategory extends Document {
    name: string;
    description: string;
}

const childcategorySchema = new Schema<childcategory>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true
    }
})

const Childcategory = model<childcategory>('Category', childcategorySchema)
export default Childcategory