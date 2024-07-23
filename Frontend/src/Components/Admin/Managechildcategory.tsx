import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import axios from 'axios';

interface CategoryData {
    _id: string;
    name: string;
    description: string;
}

interface ResponseData {
    category: CategoryData[];
}

const Managechildcategory : React.FC = () =>{
    const [categories, setCategories] = useState<CategoryData[]>([]);

    const navigate = useNavigate();
    const toast = useToast()

    const handleAddcategory = () =>{
        navigate('/admin/adminhome/add-childcategory')
    }
    
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axios.get<ResponseData>('/api/admin/get-childcategory');
                console.log(response.data); 
                if (response.data) {
                    setCategories(response.data.category);
                }
            }
            catch (error) {
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                });
            }
        }
        fetchCategory()
    },[])

    const handleEditCategory = (categoryId:string) =>{
        navigate(`/admin/adminhome/edit-category/${categoryId}`)
    }
    
    const handleDeleteCategory = (categoryId: string, categoryName: string) => {
        toast({
            title: `Delete ${categoryName}`,
            description: `Are you sure you want to delete ${categoryName}? This action cannot be undone.`,
            status: 'warning',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
            render: ({ onClose }) => (
                <div>
                    <button
                        onClick={async () => {
                            try {
                                await axios.delete(`/api/admin/delete-category/${categoryId}`);
                                setCategories(prevCategories => prevCategories.filter(category => category._id !== categoryId));
                                toast({
                                    title: 'Delete Successful',
                                    description: `${categoryName} deleted successfully`,
                                    status: 'success',
                                    duration: 3000,
                                    isClosable: true,
                                    position: 'top-right',
                                });
                                onClose();
                            } catch (error) {
                                toast({
                                    title: 'Delete Error',
                                    description: error instanceof Error ? error.message : 'An unknown error occurred',
                                    status: 'error',
                                    duration: 3000,
                                    isClosable: true,
                                    position: 'top-right',
                                });
                            }
                        }}
                        className="px-8 py-3 font-semibold rounded bg-red-500 dark:text-gray-100 text-white"
                    >
                        Confirm Delete
                    </button>
                    <button
                        onClick={onClose}
                        className="px-8 py-3 font-semibold rounded bg-gray-300 text-gray-800 ml-4"
                    >
                        Cancel
                    </button>
                </div>
            ),
        });
    };
 


    return(
        <>
            <button type="button" onClick={handleAddcategory}
            className="px-8 py-3 font-semibold rounded bg-black text-white">Add new category
            </button>
            &nbsp;
            <div className="container p-2 mx-auto sm:p-4 dark:text-gray-800">
                <h2 className="mb-4 text-2xl font-semibold leading-tight">Child Categories</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                        <colgroup>
                            <col />
                            <col />
                            <col />
                            <col />
                            <col className="w-24" />
                        </colgroup>
                        <thead className="dark:bg-gray-300">
                            <tr className="text-left">
                                <th className="p-3">Name</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Edit</th>
                                <th className="p-3">Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                        {categories.map((category) => (
                             <tr key={category._id} className="border-b border-opacity-20 dark:border-gray-300 dark:bg-gray-50">
                             <td className="p-3">
                                 <p className='font-bold'>{category.name}</p>
                             </td>
                             <td className="p-3">
                                 <p className='font-semibold'>{category.description}</p>
                             </td>
                             <td className="p-3">
                                 <button type="button" onClick={()=>handleEditCategory(category._id)} className="px-8 py-3 font-semibold rounded bg-black dark:text-gray-100 text-white">Edit</button>
                             </td>
                             <td className="p-3">
                                 <button type="button"  onClick={() => handleDeleteCategory(category._id, category.name)} className="px-8 py-3 font-semibold rounded bg-red-500 dark:text-gray-100 text-white">delete</button>
                             </td>
                         </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
export default Managechildcategory