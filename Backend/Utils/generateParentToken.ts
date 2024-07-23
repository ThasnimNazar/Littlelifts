import { Response } from 'express';
import { Types } from 'mongoose'
import jwt from 'jsonwebtoken';

const generateParentToken = (res: Response, parentId: Types.ObjectId) => {
    console.log('heyy')
    const token = jwt.sign({ id: parentId }, process.env.JWT_PARENT_SECRET as string, {
        expiresIn: '30d',
    });
    console.log(token,'token')

    res.cookie('parentjwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};

export default generateParentToken;
