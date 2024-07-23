import { Schema, model, Document } from 'mongoose';


interface sittingcategory extends Document {
    name: string;
    description: string;
    image:string;
}

const sittingcategorySchema = new Schema<sittingcategory>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true
    },
    image:{
        type:String,
    }
})

const Sittingcategory = model<sittingcategory>('Sittingcategory', sittingcategorySchema)
export default Sittingcategory