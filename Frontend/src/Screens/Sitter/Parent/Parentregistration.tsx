import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { RootState } from '../../../Store';
import { setParentCredentials } from '../../../Slices/Parentslice';
import { useParentregisterMutation } from '../../../Slices/Parentapislice';
import Header from "../../../Header";
import Loader from '../../../Loader';


interface FormErrors {
    [key: string]: string;
}

interface ChildCategory {
    _id:string;
    name: string;
    description: string;
}




const Parentregistration: React.FC = () => {

    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setconfirmPassword] = useState<string>('')
    const [phoneno, setPhoneno] = useState<string>('')
    const [selectedchildcategory, setSelectedChildcategory] = useState<string>('');
    const [isRegistered, setIsRegistered] = useState<boolean>(false);


    const [childcategories,setChildcategory] = useState<ChildCategory[]>([])
    const [register, { isLoading }] = useParentregisterMutation();

    const toast = useToast();
    const navigate = useNavigate();
    const dispatch = useDispatch();


    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        console.log('enter12')
        e.preventDefault();
        const formErrors: FormErrors = {};
        console.log(formErrors, '66')

        if (!name.trim()) {
            formErrors.name = 'Name is required';
        }

        if (!email.trim()) {
            formErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            formErrors.email = 'Invalid email address';
        }

        if (!phoneno.trim()) {
            formErrors.phoneno = 'Phone number is required';
        } else if (!/^\d{10}$/.test(phoneno.trim())) {
            formErrors.phoneno = 'Phone number must be 10 digits';
        }

        if (!password.trim()) {
            formErrors.password = 'Password is required';
        } else if (password.length < 6) {
            formErrors.password = 'Password must be at least 6 characters long';
        }

        if (password !== confirmPassword) {
            formErrors.confirmPassword = 'Passwords do not match';
        }

        if (!selectedchildcategory) {
            formErrors.categoryofchild = 'category required'
        }

        if (Object.keys(formErrors).length > 0) {
            Object.entries(formErrors).forEach(([field, errorMessage]) => {
                toast({
                    title: `${field.charAt(0).toUpperCase() + field.slice(1)} Error`,
                    description: errorMessage,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                    position: "bottom-right",
                });
            });
        } else {
            try {
                const res = await register({ name, email, phoneno, password, confirmPassword, selectedchildcategory }).unwrap();
                console.log(res, 'xx')
                dispatch(setParentCredentials({ ...res }));
                setIsRegistered(true);
                    toast({
                        title: 'Success',
                        description: 'Registration successfull',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right',
                    });
                    navigate('/parent/parentotp')
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    console.error(error.response?.data);
                    toast({
                        title: 'Error',
                        description: error.response?.data?.message || 'An unknown error occurred',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right',
                    });
                } else if (error instanceof Error) {
                    console.error(error.message); // Log the error message
                    toast({
                        title: 'Error',
                        description: error.message,
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right',
                    });
                } else {
                    console.error('An unknown error occurred');
                    toast({
                        title: 'Error',
                        description: 'An unknown error occurred',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right',
                    });
                }
            }
        }
    };

   

   

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axios.get('/api/parent/get-childcategory');
                console.log(response);
                if (response.data && Array.isArray(response.data.category)) {
                    setChildcategory(response.data.category);
                } else {
                    toast({
                        title: 'Error',
                        description: 'Invalid response format',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right',
                    });
                }
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
        fetchCategory();
    }, [toast]);

    const handleRadioChange = (categoryId:string) => {
        setSelectedChildcategory(categoryId);
    };


    return (
        <>
            <Header />
            <div className="py-10" style={{ marginBottom: '10px' }}>
                <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                    <div className="hidden lg:block lg:w-1/2 bg-cover"
                        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1565029914917-462bf4980166?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
                    </div>
                    <div className="w-full p-8 lg:w-1/2">
                        <h3 className="text-xl font-semibold text-gray-700 text-center" style={{ fontFamily: "Agrandir, Helvetica, Arial, Lucida, sans-serif" }}>Welcome!complete your registration </h3>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="border-b w-1/5 lg:w-1/4"></span>
                            <a href="/parent/parentlogin" className="text-xs text-center text-black uppercase">or login with email</a>
                            <span className="border-b w-1/5 lg:w-1/4"></span>
                        </div>
                        <form onSubmit={submitHandler}>
                            <div className="mt-2">
                                <input placeholder="Enter your name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="text" />
                            </div>
                            <div className="mt-2">
                                <input placeholder="Enter your email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="email" />
                            </div>
                            <div className="mt-2">
                                <input placeholder="Enter your phoneno" value={phoneno} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneno(e.target.value)} className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="number" />
                            </div>
                            <div className="mt-2">
                                <input placeholder="Enter your password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="password" />
                            </div>
                            <div className="mt-2">
                                <input placeholder="confirm your password" value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setconfirmPassword(e.target.value)} className="bg-white font-semibold text-sm text-black focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="password" />
                            </div>
                            <br></br>
                            <fieldset>
                                <legend className="text-sm font-bold font-medium text-gray-900">Category of child you have</legend>
                                <div className="mt-4 space-y-2">
                                    {childcategories.map((category, index) => (
                                        <label key={index} htmlFor={`Option${index}`} className="flex cursor-pointer items-start gap-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    className="size-4 rounded border-gray-300"
                                                    id={`Option${index}`}
                                                    name="category"
                                                    value={category._id}
                                                    onChange={() => handleRadioChange(category._id)}
                                                    checked={selectedchildcategory === category._id}
                                                />
                                            </div>
                                            <div>
                                                <strong className="font-medium text-gray-900">{category.name}</strong>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            <div className="mt-4">
                                <button type="submit" className="bg-black text-white font-bold py-2 px-4 w-full rounded hover:bg-gray-600">Continue</button>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="border-b w-1/5 md:w-1/4"></span>
                                <a href="/parent/parentlogin" className="text-xs text-gray-500 uppercase">or sign in</a>
                                <span className="border-b w-1/5 md:w-1/4"></span>
                            </div>
                            {isLoading && <Loader />}
                        </form>
                    </div>
                </div>
            </div>
        </>

    )
}

export default Parentregistration