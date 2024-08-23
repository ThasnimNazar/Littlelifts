import { Schema, model, Document,Types } from 'mongoose';

interface FavouriteBabysitters{
    sitters:Types.ObjectId[];
    parent:Types.ObjectId;
}

const favouriteSchema = new Schema<FavouriteBabysitters>({
    sitters:[{
        type:Schema.Types.ObjectId,
        ref:'Sitter'
    }],
    parent:{
        type:Schema.Types.ObjectId,
        ref:'Parent'
    }
},{
    timestamps:true
})

const Favourites = model<FavouriteBabysitters>('Faourites',favouriteSchema)
export type favouriteDocument = FavouriteBabysitters & { _id: Types.ObjectId };

export default Favourites
