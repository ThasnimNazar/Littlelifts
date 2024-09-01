import { useState,useEffect } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { adminApi } from '../../Axiosconfig';


interface FormErrors {
    [key: string]: string;
}


const Editsubscription:React.FC = () =>{

    const [name,setName ] = useState<string>('')
    const [ price,setPrice ] = useState<string>('')
    const [ description,setDescription ] = useState<string>('')
    const [billingcycle,setBillingcycle ] = useState<string>('')
    const { id } = useParams<{ id: string }>();
    console.log(id)
    const toast = useToast();
    const navigate = useNavigate();

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };
    
    const handleBillingcycleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
    };

    const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
    };


    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await adminApi.get(`/get-editsubscriptions/${id}`);
                console.log(response, 'res');
                setName(response.data.subscriptions.name);
                setDescription(response.data.subscriptions.description);
                setBillingcycle(response.data.subscriptions.billingcycle)
                setPrice(response.data.subscriptions.price)
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
    }, [id, toast]);

    const submitHandler = async (event: React.FormEvent) => {
        event.preventDefault();

        const formErrors: FormErrors = {};

        if (!name.trim()) {
            formErrors.name = 'Name is required';
        } else if (name.length < 3 || name.length > 50) {
            formErrors.name = 'Name must be between 3 and 50 characters';
        }

        const numericPrice = Number(price); 
        if ( numericPrice < 0) {
            formErrors.price = 'Price must be a positive number';
        }

        if (!billingcycle.trim()) {
            formErrors.billingcycle = 'billing cycle is required'
        } else if (billingcycle.length > 50 || billingcycle.length < 3) {
            formErrors.billingcycle = 'length should between 3 and 50'
        }


        if (!description) {
            formErrors.description = 'description is required'
        }
        if (description.length > 500 || description.length < 3) {
            formErrors.description = 'length should between 3 and 500'
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
                const response = await adminApi.put(`/edit-subscription/${id}`, {
                    name,
                    price,
                    billingcycle,
                    description,
                })
                console.log(response)
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
                navigate('/admin/adminhome/manage-subscription')
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
    }

    return(
        <>
          <div className="flex items-center justify-center text-center dark:bg-gray-50 dark:text-gray-800" style={{ margin: '40px', overflow: 'hidden' }}>
                <form onSubmit={submitHandler} className="flex flex-col w-full max-w-lg p-12 rounded shadow-lg dark:text-gray-800" style={{ gap: '15px' }}>
                    <h2 className="font-semibold">Edit Sitting Category</h2><br />
                    <input
                        id="name"
                        type="text"
                        value={name}
                        placeholder="Add category name"
                        onChange={handleNameChange}
                        className="flex items-center h-12 px-4 mt-2 rounded dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-500 focus:dark:ring-violet-500 border-2 border-indigo-300 border-solid border-2"
                    />
                    <div>
                        <textarea
                            id="description"
                            className="mt-2 w-full flex items-center h-12 px-4 rounded-lg dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-500 focus:dark:ring-violet-500 border-2 border-indigo-300 border-solid border-2"
                            rows={4}
                            value={description}
                            onChange={handleDescriptionChange}
                            placeholder="Add description"
                        ></textarea>
                    </div>
                    <div>
                    <input
                        id="billing cycle"
                        type="text"
                        value={billingcycle}
                        placeholder="Add billing cycle name"
                        onChange={handleBillingcycleChange}
                        className="flex items-center h-12 px-4 mt-2 rounded dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-500 focus:dark:ring-violet-500 border-2 border-indigo-300 border-solid border-2"
                    />
                    </div>
                    <div>
                    <input
                        id="price"
                        type="number"
                        value={price}
                        placeholder="Add price name"
                        onChange={handlePriceChange}
                        className="flex items-center h-12 px-4 mt-2 rounded dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-500 focus:dark:ring-violet-500 border-2 border-indigo-300 border-solid border-2"
                    />
                    </div>
                    <button type="submit" className="flex items-center justify-center h-12 px-6 mt-8 text-sm font-semibold rounded dark:bg-violet-600 dark:text-gray-50 bg-black text-white">Edit Category</button>
                </form>
            </div>
        </>
    )
}

export default Editsubscription