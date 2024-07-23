import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Admin, { AdminDocument } from '../Models/adminModel';
import generateAdmintoken from '../Utils/generateAdminToken';
import Sitter from '../Models/sitterModel';
import Parent from '../Models/parentModel'
import mongoose from 'mongoose';

interface LoginData {
    email: string;
    password: string;
}

const registerAdmin = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { name, email, password, adminRegistrationKey } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email or password is missing in the request, registration failed' });
            return;
        }

        if (!adminRegistrationKey) {
            res.status(400).json({ message: 'No admin registration code, registration aborted' });
            return;
        }

        if (process.env.ADMIN_REGISTRATION_KEY !== adminRegistrationKey) {
            res.status(401).json({ message: 'Invalid admin registration code' });
            return;
        }

        const userExists = await Admin.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: 'User already exists with this email' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new Admin({
            name,
            email,
            password: hashedPassword,
        }) as AdminDocument;

        await user.save();

        if (user) {
            generateAdmintoken(res, user._id);

            const registeredUserData = {
                _id: user._id,
                name: user.name,
                email: user.email,
            };

            res.status(201).json({ message: 'Registration successful', admin: registeredUserData });
        } else {
            res.status(400).json({ message: 'Invalid user data, registration failed' });
        }
    }

    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

const adminLogin = asyncHandler(async (req: Request<{}, {}, LoginData>, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        console.log(req.body)

        if (!email || !password) {
            res.status(401).json({ message: 'email or password is missining in the request' })
            return;
        }

        const admin = await Admin.findOne({ email: email }) as mongoose.Document<unknown, {}, Admin> & Admin & { _id: mongoose.Types.ObjectId }
        console.log(admin, 'oo')

        let passwordValid = false;

        if (admin) {
            passwordValid = await bcrypt.compare(password, admin.password)
            console.log(passwordValid, 'll')

        }

        if (passwordValid) {
            console.log('hey')

            generateAdmintoken(res, admin._id); // Middleware to Generate token and send it back in response object

            const registeredAdminData = {
                name: admin.name,
                email: admin.email
            }


            res.status(201).json({message:'login successfully',admin:registeredAdminData});

        }

        if (!admin || !passwordValid) {
            res.status(401).json({ message: 'Invalid email or password,admin authenticaton failed' })
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const adminLogout = asyncHandler(async (req: Request, res: Response) => {
    try {
        res.cookie('adminJwt', '', {
            httpOnly: true,
            expires: new Date(0)
        })
        res.status(200).json({ message: 'logout user' })
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const getallParent = asyncHandler(async(req:Request,res:Response):Promise<void>=>{
    try{
        const parent = await Parent.find({}, { name: 1, email: 1 });
        if( parent ){
        res.status(200).json({ parent });
    }else{
        res.status(404).json({message:'user data fetch failed'})
    }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})



const getSitters = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const sitters = await Sitter.find({});
        if (!sitters || sitters.length === 0) {
            res.status(404).json({ message: 'No sitters found' });
            return; 
        }
        
        console.log("Sitters found:", sitters);

        res.status(200).json([sitters]); 
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});


const verifySitter = asyncHandler(async(req:Request<{sitterId:string}>,res:Response)=>{
    try{
    const { sitterId } = req.params;
    const sitter = await Sitter.findById({_id:sitterId})
    if(!sitter){
        res.status(404).json({message:"sitter not found"})
        return;
    }
    sitter.verified = true;
    await sitter.save()
    res.status(200).json({message:"Registered sitter verified"})
}
catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    } else {
        console.error('An unknown error occurred');
        res.status(500).json({ message: 'An unknown error occurred' });
    }
}

})

const blockSitter = asyncHandler(async(req:Request,res:Response)=>{
    try{

        const { sitterId } = req.params;
        const sitter = await Sitter.findById({_id:sitterId})
        if(!sitter){
            res.status(404).json({message:"sitter not found"})
            return;
        }

        sitter.blocked = true;
        await sitter.save()
        res.status(200).json({message:'sitter blocked'})
      
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
    
})

const unblockSitter = asyncHandler(async(req:Request,res:Response)=>{
    try{
        const { sitterId } = req.params;
        const sitter = await Sitter.findById({_id:sitterId})
        if(!sitter){
            res.status(404).json({message:"sitter not found"})
            return;
        }

        sitter.blocked = false;
        await sitter.save()
        res.status(200).json({message:'sitter blocked'})
      
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
    
})


const getParent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const parents = await Parent.find({});
        if (!parents || parents.length === 0) {
            res.status(404).json({ message: 'No sitters found' });
            return; 
        }
        
        console.log("Sitters found:", parents);

        res.status(200).json([parents]); 
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

const blockParent = asyncHandler(async(req:Request,res:Response)=>{
    try{

        const { parentId } = req.params;
        const parent = await Parent.findById({_id:parentId})
        if(!parent){
            res.status(404).json({message:"parent not found"})
            return;
        }

        parent.blocked = true;
        await parent.save()
        res.status(200).json({message:'parent blocked'})
      
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
    
})

const unblockParent = asyncHandler(async(req:Request,res:Response)=>{
    try{
        const { parentId } = req.params;
        const parent = await Parent.findById({_id:parentId})
        console.log(parent)

        if(!parent){
            res.status(404).json({message:"parent not found"})
            return;
        }

        parent.blocked = false;
        await parent.save()
        res.status(200).json({message:'sitter blocked'})
      
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.error('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
    
})



export {
    registerAdmin, adminLogin, adminLogout, getallParent,getSitters,verifySitter,blockSitter,unblockSitter,getParent,blockParent,unblockParent
};
