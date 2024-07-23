import Childcategory from "../Models/childcategoryModel";
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import Admin from "../Models/adminModel";
import { promisify } from 'util';
import Sittingcategory from "../Models/sittingcategoryModel";
import { uploadSingleImage } from '../Connections/upload';

const uploadSingleImagePromise = promisify(uploadSingleImage);

interface addChild {
    name: string;
    description: string;
}

interface addSitting {
    name: string;
    description: string;
}

interface NameBody{
    ids:string[];
}


const addChildcategory = asyncHandler(async (req: Request<{}, {}, addChild>, res: Response) => {
    try {
        const { name, description } = req.body;
        const categoryExists = await Childcategory.findOne({ name, description });

        if (categoryExists) {
            res.status(400).json({ message: 'Category already exists with this name and description' });
            return;
        }

        const newChildCategory = new Childcategory({
            name: name,
            description: description,
        });

        await newChildCategory.save();
        res.status(200).json({ message: 'New category added successfully', childcategory: newChildCategory });

    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});



const editChildcategory = asyncHandler(async (req: Request<{ categoryId: string }, {}, addChild>, res: Response) => {
    try {
        const { categoryId } = req.params;
        const { name, description } = req.body;

        const categoryFind = await Childcategory.findById(categoryId);
        if (!categoryFind) {
            res.status(400).json({ message: 'Category does not exist' });
            return;
        }

        const updatedCategory = await Childcategory.findOneAndUpdate(
            { _id: categoryId },
            { name: name, description: description },
            { new: true }
        );

        if (!updatedCategory) {
            res.status(400).json({ message: 'Failed to update the category' });
            return;
        }

        res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });

    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});



const deleteChildcategory = asyncHandler(async (req: Request<{ categoryId: string }, {}>, res: Response) => {
    try {
        const { categoryId } = req.params;
        const categoryExist = await Childcategory.findById({ _id: categoryId })
        if (!categoryExist) {
            res.status(400).json({ message: 'category doesnt exist' })
        }

        await Childcategory.findByIdAndDelete({
            _id: categoryId
        })
        res.status(200).json({ message: 'category deleted successfully' })
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})



const addSittingcategory = asyncHandler(async (req: Request<{}, {}, addSitting>, res: Response) => {
    try {
        console.log('add')
        const { name, description } = req.body;

        const sittingFind = await Sittingcategory.findOne({ name, description })

        if (sittingFind) {
            res.status(400).json({ message: 'sitting category already exists' })
            return;
        }

        const newSitting = new Sittingcategory({
            name: name,
            description: description
        })

        await newSitting.save()

        res.status(200).json({ message: 'new sitting option added successfully', sittingcategory: newSitting })

    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const editSittingcategory = asyncHandler(async (req: Request<{ sittingId: string }, {}, { name: string; description: string,image:string }>, res: Response) => {

    await uploadSingleImagePromise(req, res); 
    const { sittingId } = req.params;
    const { name, description } = req.body;
    const image = (req.file as any).location;

    const findSitting = await Sittingcategory.findById(sittingId);
    if (!findSitting) {
        res.status(400).json({ message: 'Sitting category does not exist' });
        return;
    }
    const updatedData: any = {};

    if (image) {
        updatedData.image = image;
    }

    if (name) {
        updatedData.name = name;
    }

    if (description) {
        updatedData.description = description;
    }


    const updatedSittingCategory = await Sittingcategory.findOneAndUpdate(
        { _id: sittingId },
        { $set: updatedData },
        { new: true }
    );

    if (!updatedSittingCategory) {
        res.status(400).json({ message: 'Failed to update the category' });
        return;
    }

    res.status(200).json({ message: 'Category updated successfully', category: updatedSittingCategory });
});

const deleteSittingcategory = asyncHandler(async (req: Request<{ sittingId: string }, {}>, res: Response) => {
    try {
        console.log('delete')
        const { sittingId } = req.params;
        const sittingExist = await Sittingcategory.findById({ _id: sittingId })
        if (!sittingExist) {
            res.status(400).json({ message: 'sitting category doesnt exist' })
            return;
        }

        await Sittingcategory.findByIdAndDelete({
            _id: sittingId
        })
        res.status(200).json({ message: ' sitting category deleted successfully' })
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }

})

const getAllsittingCategory = asyncHandler(async(req:Request,res:Response):Promise<void>=>{
    try{
    const categories = await Sittingcategory.find({})
    if(categories){
    res.status(200).json({category:categories})
    }
    else{
    res.status(500).json({message:'failed to fetch categories'})
    return;
    }
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const getsittingCategory = asyncHandler(async(req:Request<{sittingId:string}>,res:Response)=>{
    try{
        const { sittingId } = req.params;
        const sittingFind = await Sittingcategory.findById({_id:sittingId});

        if(!sittingFind){
            res.status(404).json({message:'sitter not found'})
            return;
        }

        res.status(200).json({category:sittingFind})

    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const getAllchildCategory = asyncHandler(async(req:Request,res:Response)=>{
    try{
        const categories = await Childcategory.find({});
        console.log(categories)
        if(categories){
            res.status(200).json({category:categories})
        }
        else{
            res.status(500).json({message:'error fetching data'})
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const getchildCategory = asyncHandler(async(req:Request<{categoryId:string}>,res:Response):Promise<void>=>{
    try{

        const { categoryId } = req.params;
        const category = await Childcategory.findById({_id:categoryId})
        if(category){
            res.status(200).json({category})
        }
        else{
            res.status(500).json({message:'error fetching data'})
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
            res.status(500).json({ message: error.message });
        } else {
            console.log('An unknown error occurred');
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
})

const getName = (async (req: Request, res: Response) => {
    try {
        console.log('heyy')
      const { ids } = req.body;
      const childcategories = await Childcategory.find({ _id: { $in: ids } });
  
      if (!childcategories.length) {
        return res.status(404).json({ message: 'Categories not found' });
      }
  
      const names = childcategories.map(category => category.name);
  
      res.status(200).json({ names });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
      } else {
        console.log('An unknown error occurred');
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  });
  





export {
    addChildcategory,
    editChildcategory,
    deleteChildcategory,
    addSittingcategory,
    editSittingcategory,
    deleteSittingcategory,
    getAllsittingCategory,
    getsittingCategory,
    getAllchildCategory,
    getchildCategory,
    getName
};
