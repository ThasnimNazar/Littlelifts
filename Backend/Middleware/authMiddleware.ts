import Parent, { ParentDocument } from "../Models/parentModel";
import Sitter, { SitterDocument } from '../Models/sitterModel'
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler'
import { ObjectId,Types } from 'mongoose';
import mongoose from 'mongoose';




interface DecodedTokenParent {
    id: string;
}

interface DecodedTokenSitter {
    id: string;
}





interface AuthenticatedRequest extends Request {
    parent?: ParentDocument;
}

interface AuthenticatedSitter extends Request {
    sitter?: SitterDocument
}

const protectParent = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.parentjwt;
    console.log(token,'hh')

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_PARENT_SECRET as string) as DecodedTokenParent;
            console.log(decoded,'decode')
            const user = await Parent.findById(decoded.id).select('-password') as ParentDocument | null;
            console.log(user,'pp')

            if (user) {
                req.parent = user;
                next();
            } else {
                res.status(401).json({ message: 'User not found' });
            }
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    } else {
        res.status(401).json({ message: 'No token provided' });
    }
})

const protectSitter = asyncHandler(async (req: AuthenticatedSitter, res: Response, next: NextFunction) => {
    const token = req.cookies.sitterjwt;
    console.log(token)

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SITTER_SECRET as string) as DecodedTokenSitter;
            const user = await Sitter.findById(decoded.id).select('-password') as SitterDocument | null;
            console.log(user,'hee')

            if (user) {
                console.log('haa')
                req.sitter = user;
                next();
            } else {
                res.status(401).json({ message: 'User not found' });
            }
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    } else {
        res.status(401).json({ message: 'No token provided' });
    }
})

export { protectParent,protectSitter }