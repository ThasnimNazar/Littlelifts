import { useState,useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useToast } from "@chakra-ui/react"
import { RootState } from "../../../Store"
import Loader from "../../../Loader"
import Header from "../../../Header"


const Forgetpasswordscreen : React.FC = () =>{
    const [email,setEmail] = useState<string>('')
    const [parent,setParent] = useState<string>('')
    const { parentInfo } = useSelector((state:RootState)=>state.parentAuth)
    const parentId = parentInfo?._id;
    const navigate = useNavigate()
    const toast = useToast()


    const submitHandler = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        try {
            const response = await axios.post('/api/parent/forget-password', { email });
           if(response.status === 200){
            toast({
                title: 'Success',
                description: 'OTP sent to your email',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
              });
              console.log('Navigating to OTP verification page...');
              navigate('/parent/forget-otp');  
           } 
            
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

    useEffect(()=>{
        if(parentInfo){
            navigate('/parent/parenthome')
        }
    },[])

    return(
        <>
        <Header/>
         <div className="py-10" style={{ marginBottom: '10px' }}>
                <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                    <div className="hidden lg:block lg:w-1/2 bg-cover"
                        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1565029914917-462bf4980166?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')` }}>
                    </div>
                    <div className="w-full p-8 lg:w-1/2">
                        <h3 className="text-xl font-semibold text-gray-700 text-center" style={{ fontFamily: "Agrandir, Helvetica, Arial, Lucida, sans-serif" }}>Welcome! Login </h3>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="border-b w-1/5 lg:w-1/4"></span>
                            <a href="#" className="text-xs text-center text-black uppercase">or Register</a>
                            <span className="border-b w-1/5 lg:w-1/4"></span>
                        </div>
                        <h1 className="px-4 py-3 w-5/6 text-center text-gray-600 font-bold">Sign in with Google</h1>

                        <form onSubmit = {submitHandler}>

                            <div className="mt-2">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                                <input value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="email" />
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

export default Forgetpasswordscreen