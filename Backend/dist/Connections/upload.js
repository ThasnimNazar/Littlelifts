"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadSingleImage = exports.uploadSingle = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
//to interact with aws
const multer_s3_1 = __importDefault(require("multer-s3"));
//storage engine 4 multer to directly upload files to the s3 bucket
const multer_1 = __importDefault(require("multer"));
//its a middleware to handle multiform data,and for uploading files
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const s3 = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION,
}); //an instance of s3 client is created with secretkey,access key,and aws region
const upload = (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        key: (req, file, cb) => {
            cb(null, Date.now().toString() + '-' + file.originalname);
        },
    }),
}); //creates an multer indtance with storsge of multerS3 where the file will be directly save to the s3 bucket,
//s3-created s3 instance,key-unique key for uploaded file
exports.uploadSingle = upload.single('profileImage');
exports.uploadSingleImage = upload.single('image');
exports.uploadMultiple = upload.array('verificationDocuments', 10);
