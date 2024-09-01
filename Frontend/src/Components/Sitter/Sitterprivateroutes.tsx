import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../Store'

const Sitterprivateroutes = () => {


   const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth)
   

   const sitterId = sitterInfo?._id;
   console.log(sitterId)
     

   console.log(sitterInfo,'siiiii')

   return sitterInfo && sitterInfo?.blocked === false ? <Outlet /> : <Navigate to='/sitter/sitterlogin' replace />
}

export default Sitterprivateroutes