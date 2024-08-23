import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../Store";



const AdminprivateRoutes = () => {

    const { adminInfo } = useSelector((state:RootState) => state.adminAuth);

    return adminInfo ? <Outlet/> : <Navigate to='/admin/login' replace />

}

export default AdminprivateRoutes;