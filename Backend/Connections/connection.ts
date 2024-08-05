import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {          

    try {
        const mongoUri = process.env.MONGO_URI;
        console.log(mongoUri,'mongouri')
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in the environment variables');
        }
        
        const connectMongoDB = await mongoose.connect(mongoUri);
        console.log(connectMongoDB,'connect')

        console.log(`MongoDB connected successfully: ${connectMongoDB.connection.host}`);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error connecting to MongoDB: ${error.message}`);
        } else {
            console.error(`Error connecting to MongoDB: ${error}`);
        }
        
        process.exit(1);
    }
};


export {connectDB }