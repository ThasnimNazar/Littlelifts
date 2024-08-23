import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { Types } from 'mongoose';

const generateAdmintoken = (res: Response,  userId: Types.ObjectId) => {
    console.log('admin');

    const jwtToken = jwt.sign({ userId }, process.env.JWT_SECRET_KEY_ADMIN!, { expiresIn: '30d' });

    const cookieOptions = {
        httpOnly: true, // To prevent cookies from being accessed by client-side scripts
        secure: process.env.NODE_ENV !== 'development', // Value will be false in the development environment and hence http will be allowed in development
        sameSite: 'strict' as const, // Sets sameSite to 'strict'
        maxAge: 30 * 24 * 60 * 60 * 1000, // Sets expiry of cookie to 30 days
    };

    res.cookie('adminJwt', jwtToken, cookieOptions);
    return jwtToken
};

export default generateAdmintoken;
