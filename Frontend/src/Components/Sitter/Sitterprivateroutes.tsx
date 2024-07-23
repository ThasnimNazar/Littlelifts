import { Navigate,Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Sitterprivateroutes = () =>{

   const { sitterInfo } = useSelector((state)=>state.sitterAuth)
   return sitterInfo ? <Outlet/> : <Navigate to = '/sitter/sitterlogin' replace />
}

export default Sitterprivateroutes