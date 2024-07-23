import React, { useState,useEffect } from 'react';
import OtpInput from 'react-otp-input';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import 'tailwindcss/tailwind.css';
import axios from 'axios';
import Header from '../../Header';
import Resendotp from '../../Components/Parent/Resendotp';
import { RootState } from '../../Store';


const Sitterforgetotp : React.FC = () =>{

    const [otp, setOtp] = useState<string>('');
    const [resendTimeout,setResendTimeout] = useState<number>(60)
    
    const { sitterInfo } = useSelector((state:RootState)=>state.sitterAuth)
    console.log(sitterInfo,'si')
    const sitterId = sitterInfo?._id

  
    const toast = useToast();
    const navigate = useNavigate();
  
  
  
    const handleChange = (otp: string) => {
      setOtp(otp);
    };  

    useEffect(()=>{
        if(resendTimeout === 0) return
    
        const timer = setTimeout(()=>{
          setResendTimeout((prevTime)=> (prevTime ===0) ? 0 : prevTime - 1)
        },1000)
        return () => clearTimeout(timer);
      },[resendTimeout])
    
      const resendOtpHandler = async () => {
        try{
          toast({
            title: 'resending otp...',
            status: 'info',
            isClosable: true,
          })
         await axios.post('/api/sitter/resendotp')
         toast({
          title: 'resend otp successfully',
          status: 'success',
          isClosable: true,
        })
        setResendTimeout(60)
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
    
      const submitHandler = async () => {
        try {
          const response = await axios.post('/api/sitter/verify-passwordotp', {
            otp,
            sitterId
          });    
    
          console.log(response);
    
          if (response.status === 200) {
            toast({
              title: 'Success',
              description: 'OTP verification successfully completed',
              status: 'success',
              duration: 3000,
              isClosable: true,
              position: 'top-right',
            });
            navigate('/sitter/reset-password');
          }   
        } catch (error) {
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
      };
    
  
   
    return(
        <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="card w-full max-w-md p-8 bg-white rounded-lg shadow-md" style={{ alignItems: 'center', justifyContent: 'center', marginBottom: '200px', borderColor: '20px black', borderRadius: '5px' }}>
            <h2 className="text-2xl font-bold mb-4 text-center" style={{ textDecoration: 'underline', textDecorationColor: 'yellow' }}>Enter OTP</h2>
            <OtpInput
              value={otp}
              onChange={handleChange}
              numInputs={4}
              renderSeparator={<span>-</span>}
              renderInput={(props) => (
                <input
                  {...props}
                  className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontSize: '1.5rem' }} 
                />
              )}
              containerStyle="flex justify-center"
            />
            <button
              onClick={submitHandler}
              className="mt-4 text-white rounded-md bg-black"
              style={{ width: '100px', height: '50px', alignItems: 'center' }}
            >
              Verify OTP
            </button>
            <br></br>
            <Resendotp handleFunction = {resendOtpHandler} resendTimeout = {resendTimeout} />
          </div>
        </div>
      </>
    )
}

export default Sitterforgetotp