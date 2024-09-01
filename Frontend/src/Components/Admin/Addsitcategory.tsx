import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AxiosError } from 'axios';
import { adminApi } from '../../Axiosconfig';
import { useToast } from '@chakra-ui/react'

interface FormErrors {
    [key: string]: string;
}

interface AddCategory {
    name: string;
    description: string;
}

interface CategoryResponse {
    sittingcategory: AddCategory;
    message: string;
}


const Addsitcategory: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('')

    const toast = useToast();
    const navigate = useNavigate()

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value)
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formErrors: FormErrors = {};

        if (!name.trim()) {
            formErrors.name = 'Name is required';
        } else if (name.length < 3 || name.length > 50) {
            formErrors.name = 'Name must be between 3 and 50 characters';
        }

        if (!description.trim()) {
            formErrors.description = 'Please write something in description';
        } else if (description.length < 10) {
            formErrors.description = 'description section should have at least 10 characters';
        } else if (description.length > 500) {
            formErrors.description = 'description section should not exceed 200 characters';
        }

        if (Object.keys(formErrors).length > 0) {
            Object.entries(formErrors).forEach(([field, errorMessage]) => {
                toast({
                    title: `${field.charAt(0).toUpperCase() + field.slice(1)} Error`,
                    description: errorMessage,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: "top-right",
                });
            });
        }
        else {
            try {
                const response = await adminApi.post<CategoryResponse>('/add-sittingcategory', {
                    name, description
                })
                console.log(response, 'res')
                if (response.data) {
                    toast({
                        title: "added category Successful",
                        description: response.data.message,
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                        position: "top-right",
                    });
                }
                navigate('/admin/adminhome/manage-sittingcategories')
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError<CategoryResponse>;
                    if (axiosError.response?.data.message) {
                        const errorMessage = axiosError.response.data.message;
                        toast({
                            title: 'adding category Error',
                            description: errorMessage,
                            status: 'error',
                            duration: 5000,
                            isClosable: true,
                            position: "top-right",
                        });
                    } else {
                        console.log('Error:', error.message);
                    }
                }
            }
        }

    }
    return (
        <>
            <div className="flex items-center justify-center text-center dark:bg-gray-50 dark:text-gray-800" style={{ margin: '40px', overflow: 'hidden' }}>
                <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-lg p-12 rounded shadow-lg dark:text-gray-800" style={{ gap: '15px' }}>
                    <h2 className="font-semibold">Add new sitting category</h2><br />
                    <input id="name" type="name" value={name} placeholder="Add category name" onChange={handleNameChange} className="flex items-center h-12 px-4 mt-2 rounded dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-500 focus:dark:ring-violet-500 border border-indigo-300 border-solid border-2" />
                    <div>
                        <textarea
                            id="description"
                            className="mt-2 w-full flex items-center h-12 px-4 rounded-lg dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-500 focus:dark:ring-violet-500 border border-indigo-300 border-solid border-2"
                            rows={4}
                            value={description}
                            onChange={handleDescriptionChange}
                            placeholder="add description"
                        ></textarea>
                    </div>
                    <button type="submit" className="flex items-center justify-center h-12 px-6 mt-8 text-sm font-semibold rounded dark:bg-violet-600 dark:text-gray-50 bg-black text-white">Add category</button>
                </form>
            </div>        
        </>
    )
}

export default Addsitcategory