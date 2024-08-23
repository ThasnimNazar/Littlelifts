import Adminheader from "../../../Layouts/Adminlayouts/Adminheader"
import { useState,useEffect } from 'react'
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useDispatch,useSelector } from 'react-redux'
import  { useAdminloginMutation} from '../../../Slices/Adminapislice'
import { RootState } from "../../../Store";
import { setCredentials } from "../../../Slices/Adminslice";


interface FormErrors {
    [key: string]: string;
  }

const Adminloginscreen : React.FC = () =>{
    const [email,setEmail] = useState<string>('');
    const [password,setPassword ] = useState<string>('');

    const toast = useToast();
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const [login] = useAdminloginMutation();
    const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

    const submitHandler = async(event:React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    const formErrors: FormErrors = {};

    if (!email.trim()) {
        formErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        formErrors.email = 'Invalid email address';
      }
  
      if (!password.trim()) {
        formErrors.password = 'Password is required';
      } else if (password.length < 6) {
        formErrors.password = 'Password must be at least 6 characters long';
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
    try{

        const response  = await login({email,password}).unwrap();
        console.log(response,'login')
        const token = response.token
        const role = response.role;
        localStorage.setItem('adminToken',token)
        localStorage.setItem('role',role)
        dispatch(setCredentials({...response.admin}))
        toast({
            title: "Success",
            description: response.message,
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: "top-right",
          });
          navigate('/admin/adminhome');

    }
    catch (error) {
        toast({
          title: "Registration Failed",
          description: (error as { data: { message: string } }).data.message || 'Something went wrong',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }
    }   
    }

    
    useEffect(()=>{
        if(adminInfo){
            navigate('/admin/adminhome');
        }
    })

    return(
        <>
        <Adminheader/>
        <div className="flex items-center justify-center text-center dark:bg-gray-50 dark:text-gray-800 m-20">
	<form onSubmit={submitHandler} className="flex flex-col w-full max-w-lg p-12 bg-black rounded shadow-lg dark:text-gray-800">
    <h4 className="mb-5 text-5xl font-semibold text-white" style={{ fontFamily: "Agrandir, Helvetica, Arial, Lucida, sans-serif" }}>Please login</h4>
		<input id="username" type="text" value={email} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>setEmail(e.target.value)} placeholder='enter email' className=" rounded-xl flex items-center h-12 px-4 mt-2 rounded dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-600 focus:dark:ring-violet-600" />
		<input id="password" type="password" value={password} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>setPassword(e.target.value)} placeholder='enter password' className="rounded-xl flex items-center h-12 px-4 mt-2 rounded dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-600 focus:dark:ring-violet-600" />
		<button type="submit" className="rounded-xl flex items-center justify-center h-12 px-6 mt-8 text-sm font-semibold rounded dark:bg-violet-600 dark:text-gray-50 bg-yellow-300">Login</button>
		<div className="flex justify-center mt-6 space-x-2 text-xs">
			<a rel="noopener noreferrer" href="#" className="dark:text-gray-600">Forgot Password?</a>
			<span className="dark:text-gray-600">/</span>
			<a rel="noopener noreferrer" href="#" className="dark:text-gray-600">Sign Up</a>
		</div>
	</form>
</div>
        </>
    )
}

export default Adminloginscreen