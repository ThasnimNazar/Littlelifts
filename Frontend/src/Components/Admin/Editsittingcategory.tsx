import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { useToast } from "@chakra-ui/react";
import { adminApi } from '../../Axiosconfig';


interface FormErrors {
    [key: string]: string;
}

interface EditCategory {
    _id: string;
    name: string;
    description: string;
    imageUrl: string; 
}

interface CategoryResponse {
    sittingcategory: EditCategory;
    message: string;
}

interface GetResponse {
    category: EditCategory;
}

const Editsittingcategory: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [image, setImage] = useState<File | null>(null); 
    const { categoryId } = useParams<{ categoryId: string }>();
    console.log(categoryId, 'id');
    const toast = useToast();
    const navigate = useNavigate();

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await adminApi.get<GetResponse>(`/get-sittingdata/${categoryId}`);
                console.log(response, 'res');
                setName(response.data.category.name);
                setDescription(response.data.category.description);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                });
            }
        };
        fetchDetails();
    }, [categoryId, toast]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formErrors: FormErrors = {};

        if (!name.trim()) {
            formErrors.name = 'Name is required';
        } else if (name.length < 3 || name.length > 50) {
            formErrors.name = 'Name must be between 3 and 50 characters';
        }

        if (!description) {
            formErrors.description = 'Please write something about yourself';
        } else if (description.length < 10) {
            formErrors.description = 'About section should have at least 10 characters';
        } else if (description.length > 500) {
            formErrors.description = 'About section should not exceed 200 characters';
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
        } else {
            try {
                const formData = new FormData();
                formData.append("name", name);
                formData.append("description", description);
                if (image) {
                    formData.append("image", image);
                }

                const response = await adminApi.put<CategoryResponse>(
                    `/edit-sittingcategory/${categoryId}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                console.log(response, 'res');
                if (response.data) {
                    toast({
                        title: "Edited category Successful",
                        description: response.data.message,
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                        position: "top-right",
                    });
                }
                navigate('/admin/adminhome/manage-sittingcategories');
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const axiosError = error as AxiosError<CategoryResponse>;
                    if (axiosError.response?.data.message) {
                        const errorMessage = axiosError.response.data.message;
                        toast({
                            title: 'Editing category Error',
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
    };

    return (
        <>
            <div className="flex items-center justify-center text-center dark:bg-gray-50 dark:text-gray-800" style={{ margin: '40px', overflow: 'hidden' }}>
                <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-lg p-12 rounded shadow-lg dark:text-gray-800" style={{ gap: '15px' }}>
                    <h2 className="font-semibold">Edit Sitting Category</h2><br />
                    <input
                        id="name"
                        type="text"
                        value={name}
                        placeholder="Add category name"
                        onChange={handleNameChange}
                        className="flex items-center h-12 px-4 mt-2 rounded dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-500 focus:dark:ring-violet-500 border border-indigo-300 border-solid border-2"
                    />
                    <div>
                        <textarea
                            id="description"
                            className="mt-2 w-full flex items-center h-12 px-4 rounded-lg dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-500 focus:dark:ring-violet-500 border border-indigo-300 border-solid border-2"
                            rows={4}
                            value={description}
                            onChange={handleDescriptionChange}
                            placeholder="Add description"
                        ></textarea>
                    </div>
                    <div>
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="mt-2 w-full flex items-center px-4 rounded-lg dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-500 focus:dark:ring-violet-500 border border-indigo-300 border-solid border-2"
                        />
                    </div>
                    <button type="submit" className="flex items-center justify-center h-12 px-6 mt-8 text-sm font-semibold rounded dark:bg-violet-600 dark:text-gray-50 bg-black text-white">Edit Category</button>
                </form>
            </div>
        </>
    );
};

export default Editsittingcategory;
