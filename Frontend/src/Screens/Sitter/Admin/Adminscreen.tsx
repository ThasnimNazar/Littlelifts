import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector,useDispatch } from 'react-redux';
import Sidebar from '../../../Components/Admin/Sidebar';
import Adminheader from '../../../Layouts/Adminlayouts/Adminheader';
import '../../../Css/Admin/Adminscreen.css'
import { setCredentials,logout } from '../../../Slices/Adminslice';
import { useLogoutadminMutation } from '../../../Slices/Adminapislice';


const Adminscreen: React.FC = () => {
  const navigate = useNavigate();
  const [logoutApi ] = useLogoutadminMutation()
  const dispatch = useDispatch();


  const handleManageParentClick = () => {
    navigate('/admin/adminhome/manage-parent');
  };

  const handleManageSittersClick = () => {
    navigate('/admin/adminhome/manage-sitters');
  };

  const handleManageCategoriesClick = () => {
    navigate('/admin/adminhome/manage-sittingcategories');
  };

  const handleChildCategoriesClick = () =>{
    navigate('/admin/adminhome/manage-childcategories');
  }

  const handleLogoutClick = async () => {
    try {
      await logoutApi({}).unwrap();
      dispatch(logout());
      navigate('/admin');
    } catch (error) {
      console.error("Logout failed: ", error);
    }
  };
  return (
    <>
    <Adminheader/>
    <div className="admin-screen-container"> 
      <Sidebar
        onManageParentClick={handleManageParentClick}
        onManageSittersClick={handleManageSittersClick}
        onManageCategoriesClick={handleManageCategoriesClick}
        onManageChildCategoriesClick={handleChildCategoriesClick}
        onLogoutClick={handleLogoutClick}
      />
      <div className="admin-content"> 
        <Outlet />
      </div>
    </div>
    </>
  );
};

export default Adminscreen;
