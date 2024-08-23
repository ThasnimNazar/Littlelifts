import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { RootState } from '../../Store'
import { setSitterCredentials } from '../../Slices/Sitterslice'

const Sitterprivateroutes = () => {


   const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth)
   

   const sitterId = sitterInfo?._id;
   console.log(sitterId)
   const toast = useToast();
   const navigate = useNavigate();
   const dispatch = useDispatch();

   

   useEffect(()=>{
      const fetchBlock = async()=>{
         try{
            const response = await axios.get('/api/sitter/check-block',{
               params: {sitterId}
            })
            console.log(response,'hhh')
            if(response.data.sitter.blocked === true){
               dispatch(setSitterCredentials({ ...response.data.sitter }));
               toast({
                  title: 'Info',
                  description: 'Your account is blocked',
                  status: 'info',
                  duration: 3000,
                  isClosable: true,
                  position: 'top-right',
              });

              navigate('/sitter/sitterlogin', { replace: true });
            }
            
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
   },[sitterInfo,toast])

   console.log(sitterInfo,'siiiii')

   return sitterInfo && sitterInfo?.blocked === false ? <Outlet /> : <Navigate to='/sitter/sitterlogin' replace />
}

export default Sitterprivateroutes