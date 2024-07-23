import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import Admin, { AdminDocument } from '../Models/adminModel';
import { ObjectId } from 'mongoose';

interface DecodedToken {
  userId: ObjectId;
}

interface AuthenticatedRequest extends Request {
  user?: AdminDocument;
}

const authenticateAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.adminJwt;

  if (token) {       
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY_ADMIN as string) as DecodedToken;
      const user = await Admin.findById(decoded.userId).select('-password') as AdminDocument | null;
      console.log(user,'hyy')

      if (user) {
        req.user = user;
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
});

export default authenticateAdmin;
