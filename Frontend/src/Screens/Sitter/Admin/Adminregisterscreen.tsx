import { useState,useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import Adminheader from "../../../Layouts/Adminlayouts/Adminheader";
import { useAdminregisterMutation } from '../../../Slices/Adminapislice';
import { AdminRegisterResponse } from "../../../Slices/Adminapislice";
import { setCredentials } from "../../../Slices/Adminslice";
import { RootState } from "../../../Store";

interface FormErrors {
  [key: string]: string;
}


const Adminregisterscreen: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [adminRegistrationKey, setAdminregistrationkey] = useState<string>('');
  const [register] = useAdminregisterMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toast = useToast();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formErrors: FormErrors = {};

    if (!name.trim()) {
      formErrors.name = 'Name is required';
    } else if (name.length < 3 || name.length > 50) {
      formErrors.name = 'Name must be between 3 and 50 characters';
    }

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

    if (!adminRegistrationKey.trim()) {
      formErrors.adminRegistrationKey = 'Admin registration key is required';
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
        const response: AdminRegisterResponse = await register({ name, email, password, adminRegistrationKey }).unwrap();
        dispatch(setCredentials({ ...response.admin }));
        toast({
          title: "Success",
          description: response.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        navigate('/admin/adminhome');
      } catch (error) {
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
  };

  
  useEffect(()=>{
    if(adminInfo){
        navigate('/admin/adminhome');
    }
})

  return (
    <>
      <Adminheader />
      <div className="flex items-center justify-center text-center dark:bg-gray-50 dark:text-gray-800" style={{ margin: '60px', gap: '10px' }}>
        <form onSubmit={submitHandler} className="flex flex-col w-full max-w-lg p-12 rounded shadow-lg dark:text-gray-800">
          <input
            id="name"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="flex items-center h-12 px-4 mt-2 rounded dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-500 focus:dark:ring-violet-500 border border-indigo-300 border-solid border-2"
          />
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="flex items-center h-12 px-4 mt-2 rounded dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-500 focus:dark:ring-violet-500 border border-indigo-300 border-solid border-2"
          />
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="flex items-center h-12 px-4 mt-2 rounded dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-500 focus:dark:ring-violet-500 border border-indigo-300 border-solid border-2"
          />
          <input
            id="adminRegistrationKey"
            placeholder="Admin Registration Key"
            value={adminRegistrationKey}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminregistrationkey(e.target.value)}
            type="password"
            className="flex items-center h-12 px-4 mt-2 rounded dark:text-gray-50 focus:outline-none focus:ring-2 focus:dark:border-violet-500 focus:dark:ring-violet-500 border border-indigo-300 border-solid border-2"
          />
          <button
            type="submit"
            className="flex items-center justify-center h-12 px-6 mt-8 text-sm font-semibold rounded dark:bg-violet-600 dark:text-gray-50 bg-black text-white"
          >
            Register
          </button>
          <div className="flex justify-center mt-6 space-x-2 text-xs">
            <a rel="noopener noreferrer" href="#" className="dark:text-gray-600">Forgot Password?</a>
            <span className="dark:text-gray-600">/</span>
            <a rel="noopener noreferrer" href="#" className="dark:text-gray-600">Sign Up</a>
          </div>
        </form>
      </div>
    </>
  );
};

export default Adminregisterscreen;
