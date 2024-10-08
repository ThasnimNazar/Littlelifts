import React, { useState } from 'react'
import { useNavigate,Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useToast } from '@chakra-ui/react'
import axios from 'axios'
import Header from '../../../Header'
import { setParentCredentials } from '../../../Slices/Parentslice'
import { publicApi } from '../../../Axiosconfig'


interface FormErrors {
    [key: string]: string;
}


const Parentlogin: React.FC = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const navigate = useNavigate()
    const toast = useToast()
    const dispatch = useDispatch();


    const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formErrors: FormErrors = {};

        if (!email.trim()) {
            formErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            formErrors.email = 'Invalid email address';
        }
        if (!password.trim()) {
            formErrors.password = 'Password is required';
        }
        else {
            try {
                const res = await publicApi.post('/api/parent/login-parent', {
                    email, password
                })
                console.log(res)
                const { parentToken } = res.data
                const role  = res.data.parent.role
                if (res.status === 200) {
                    localStorage.setItem('parentToken',parentToken)
                    localStorage.setItem('parentRole',role)
                    dispatch(setParentCredentials({ ...res.data.parent }));
                    toast({
                        title: 'Success',
                        description: 'login successfull',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right',
                    });
                }
                navigate('/')
            }
            catch (error: unknown) {
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
                    console.error(error.message);
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
    }

    
    return (
        <>
            <Header />
            <div className="py-10" style={{ marginBottom: '10px' }}>
                <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                    <div className="hidden lg:block lg:w-1/2 bg-cover"
                        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1565029914917-462bf4980166?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')` }}>
                    </div>
                    <div className="w-full p-8 lg:w-1/2">
                        <h3 className="text-xl font-semibold text-gray-700 text-center" style={{ fontFamily: "Agrandir, Helvetica, Arial, Lucida, sans-serif" }}>Welcome! Login </h3>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="border-b w-1/5 lg:w-1/4"></span>
                            <Link to="/parent/parentregister" className="text-xs text-center text-black uppercase">or Register</Link>
                            <span className="border-b w-1/5 lg:w-1/4"></span>
                        </div>

                        <form onSubmit={submitHandler}>

                            <div className="mt-2">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                                <input value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="email" />
                            </div>

                            <div className="mt-4">
                                <div className="flex justify-between">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                                    <Link to="/parent/forgetpassword" className="text-xs text-gray-500">Forget Password?</Link>
                                </div>
                                <input className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
                            </div>

                            <br></br>
                            <div className="mt-4">
                                <button type="submit" className="bg-black text-white font-bold py-2 px-4 w-full rounded hover:bg-gray-600">Continue</button>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="border-b w-1/5 md:w-1/4"></span>
                                <Link to="/parent/parentregister" className="text-xs text-gray-500 uppercase">or sign up</Link>
                                <span className="border-b w-1/5 md:w-1/4"></span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>    </>
    )
}

export default Parentlogin