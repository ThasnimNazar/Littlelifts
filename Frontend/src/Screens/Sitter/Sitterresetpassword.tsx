import { useState,useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { RootState } from '../../Store'
import api from '../../Axiosconfig';


interface FormErrors {
    [key: string]: string;
}

const Sitterresetpassword : React.FC = () =>{
    const [ password,setPassword ] = useState<string>('')
    const [ confirmPassword,setConfirmpassword ] = useState<string>('')
    const toast = useToast();
    const navigate = useNavigate();
    const { parentInfo } = useSelector((state:RootState)=>state.parentAuth)

    const submitHandler = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        
        const formErrors : FormErrors = {};
        console.log(formErrors,'66')

        if (password !== confirmPassword) {
            formErrors.password = 'Passwords do not match';
            }else if (password.length < 8) {
                formErrors.password = 'Password must be at least 8 characters long';
            }
            if (Object.keys(formErrors).length > 0) {
                Object.entries(formErrors).forEach(([field, errorMessage]) => {
                    toast({
                        title: `${field.charAt(0).toUpperCase() + field.slice(1)} Error`,
                        description: errorMessage,
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                        position: 'bottom-right',
                    });
                });
            } else
            {
        try{
          const response = await api.post('/reset-password',{
            password,confirmPassword
          })
          if(response.status === 200){
            toast({
                title: 'Success',
                description: 'password reset successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
          }
          navigate('/sitter/sitterlogin')
        }
        catch (error) {
            if (axios.isAxiosError(error) && error.response) {
              toast({
                title: 'Error',
                description: error.response.data.message || 'An unknown error occurred',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
              });
            } else {
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

    useEffect(()=>{
        if(parentInfo){
            navigate('/')
        }
    })
    return(
        <>
         <div className="py-10" style={{ marginBottom: '10px' }}>
                <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                    <div className="hidden lg:block lg:w-1/2 bg-cover"
                        style={{ backgroundImage: `url('https://img.freepik.com/free-photo/pretty-sister-spending-time-with-her-baby-brother-sitting-floor-bedroom-beautiful-young-babysitter-playing-with-little-boy-indoors-holding-stuffed-toy-duck-infancy-childcare-motherhood_344912-7.jpg')`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
                    </div>
                    <div className="w-full p-8 lg:w-1/2">
                        <h3 className="text-xl font-semibold text-gray-700 text-center" style={{ fontFamily: "Agrandir, Helvetica, Arial, Lucida, sans-serif" }}>Welcome! Login </h3>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="border-b w-1/5 lg:w-1/4"></span>
                            <a href="#" className="text-xs text-center text-black uppercase">or Register</a>
                            <span className="border-b w-1/5 lg:w-1/4"></span>
                        </div>
                        <h1 className="px-4 py-3 w-5/6 text-center text-gray-600 font-bold">Sign in with Google</h1>

                        <form onSubmit ={submitHandler}>

                            <div className="mt-2">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                                <input value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="password" />
                            </div>
                            <div className="mt-2">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Confirm password</label>
                                <input value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmpassword(e.target.value)} className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="password" />
                            </div>
                            <br></br>
                            <div className="mt-4">
                                <button type="submit" className="bg-black text-white font-bold py-2 px-4 w-full rounded hover:bg-gray-600">Continue</button>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="border-b w-1/5 md:w-1/4"></span>
                                <a href="#" className="text-xs text-gray-500 uppercase">or sign up</a>
                                <span className="border-b w-1/5 md:w-1/4"></span>
                            </div>
                        </form>
                    </div>
                </div>
            </div> 
        </>
    )
}

export default Sitterresetpassword