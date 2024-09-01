import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';


const Parentprivateroutes = () => {
    const { parentInfo } = useSelector((state: RootState) => state.parentAuth);
   
    return parentInfo ? <Outlet /> : <Navigate to='/parent/parentlogin' replace />;
};

export default Parentprivateroutes;
