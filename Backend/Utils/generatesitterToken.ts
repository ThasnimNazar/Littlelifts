import jwt from 'jsonwebtoken'
import { Response } from 'express'
import { Types } from 'mongoose';


const generateSitterToken = (res:Response,sitterId:Types.ObjectId)=>{
    console.log('sitterId = ',sitterId)
    const jwtSitterSecret = process.env.JWT_SITTER_SECRET as string | undefined;

    if (!jwtSitterSecret) {
        throw new Error('JWT_SITTER_SECRET is not defined in the environment variables.');
    }

    const token = jwt.sign({ id: sitterId.toString() }, jwtSitterSecret, {
        expiresIn: '30d'
    });

    console.log(token,'ll')

    res.cookie('sitterjwt',token,{
        httpOnly : true,// save the token in httpOnly
        secure : process.env.NODE_ENV ==='development',
        sameSite : 'strict',//to prevent csrf attack
        maxAge : 30 * 24 * 60 * 60 * 1000
    })
}

export default generateSitterToken;