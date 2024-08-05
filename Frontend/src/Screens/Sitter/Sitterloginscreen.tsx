import { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { useDispatch,useSelector } from 'react-redux'
import axios from 'axios'
import { RootState } from '../../Store'
import { setSitterCredentials } from '../../Slices/Sitterslice'
import Header from '../../Header'

interface FormErrors {
    [key: string]: string;
}



const Sitterloginscreen : React.FC = () =>{
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const { sitterInfo } = useSelector((state:RootState)=>state.sitterAuth)
    const sitterId = sitterInfo?._id;

    const navigate = useNavigate()
    const toast = useToast()
    const dispatch = useDispatch();

    const submitHandler = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        const formErrors : FormErrors = {};
  
        if (!email.trim()) {
          formErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
          formErrors.email = 'Invalid email address';
      }
      if (!password.trim()) {
          formErrors.password = 'Password is required';
      }
      else{
          try{
              const res = await axios.post('/api/sitter/login',{
                  email,password
              })
              console.log(res.data.sitter)
              console.log(res)
              if( res.status=== 200){
                  dispatch(setSitterCredentials({ ...res.data.sitter }));     
                  toast({
                      title: 'Success',
                      description: 'login successfull',
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                      position: 'top-right',
                  });
              }
              navigate('/sitter/sitterhome')
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

      useEffect(()=>{
        const fetchBlock = async()=>{
           try{
              const response = await axios.get('/api/sitter/check-block',{
                 params:{ sitterId }
              })
              console.log(response)
              dispatch(setSitterCredentials({ ...response.data.sitter }));
           }
           catch (error) {
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
        fetchBlock()
     },[])

     useEffect(()=>{
        if(sitterInfo && sitterInfo.blocked === false){
            navigate('/sitter/sitterhome')
        }
     },[])

     
  
    return(
        <>
        <Header/>
         <div className="py-10" style={{ marginBottom: '10px' }}>
                <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                    <div className="hidden lg:block lg:w-1/2 bg-cover"
                        style={{ backgroundImage: `url('https://img.freepik.com/free-photo/pretty-sister-spending-time-with-her-baby-brother-sitting-floor-bedroom-beautiful-young-babysitter-playing-with-little-boy-indoors-holding-stuffed-toy-duck-infancy-childcare-motherhood_344912-7.jpg')`,backgroundPosition: 'center', backgroundSize: 'cover' }}>
                    </div>
                    <div className="w-full p-8 lg:w-1/2">
                        <h3 className="text-xl font-semibold text-gray-700 text-center" style={{ fontFamily: "Agrandir, Helvetica, Arial, Lucida, sans-serif" }}>Welcome! Login </h3>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="border-b w-1/5 lg:w-1/4"></span>
                            <a href="#" className="text-xs text-center text-black uppercase">or Register</a>
                            <span className="border-b w-1/5 lg:w-1/4"></span>
                        </div>
                        <h1 className="px-4 py-3 w-5/6 text-center text-gray-600 font-bold">Sign in with Google</h1>

                        <form onSubmit={submitHandler}>

                            <div className="mt-2">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                                <input value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="email" />
                            </div>

                            <div className="mt-4">
                                <div className="flex justify-between">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                                    <a href="/sitter/forgetpassword" className="text-xs text-gray-500">Forget Password?</a>
                                </div>
                                <input className="bg-white text-black font-semibold text-sm focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none" type="password" value={password}  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
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

export default Sitterloginscreen