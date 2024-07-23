import { S3Client } from '@aws-sdk/client-s3';
//to interact with aws
import multerS3 from 'multer-s3';
//storage engine 4 multer to directly upload files to the s3 bucket
import multer from 'multer';
//its a middleware to handle multiform data,and for uploading files
import dotenv from 'dotenv';

dotenv.config();

interface MulterRequest extends Request {
    file: {
        location: string; 
    };
}

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.AWS_REGION!,
});//an instance of s3 client is created with secretkey,access key,and aws region

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME!,
        key: (req, file, cb) => {
            cb(null, Date.now().toString() + '-' + file.originalname);
        },
    }),
});//creates an multer indtance with storsge of multerS3 where the file will be directly save to the s3 bucket,
//s3-created s3 instance,key-unique key for uploaded file

export const uploadSingle = upload.single('profileImage');
export const uploadSingleImage = upload.single('image');
export const uploadMultiple = upload.array('verificationDocuments', 10); 
