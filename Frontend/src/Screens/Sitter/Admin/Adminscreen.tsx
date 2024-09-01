import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Sidebar from '../../../Components/Admin/Sidebar';
import Adminheader from '../../../Layouts/Adminlayouts/Adminheader';
import '../../../Css/Admin/Adminscreen.css'
import { logout } from '../../../Slices/Adminslice';
import '../../../Css/Admin/Dashboard.css'
import '../../../Css/Admin/Body.css'
import { adminApi } from '../../../Axiosconfig';



const Adminscreen: React.FC = () => {
  const navigate = useNavigate();
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

  const handleSubscriptionplan =() =>{
    navigate('/admin/adminhome/manage-subscription')
  }

  const handleDashboard =() =>{
    navigate('/admin/adminhome')
  }

  const handleLogoutClick = async () => {
    try {
      await adminApi.post('/logout')
      dispatch(logout());
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminRole')
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
        onManageSubscriptions={handleSubscriptionplan}
        handleDashboard={handleDashboard}
      />
      <div className="admin-content"> 
        <Outlet />
      </div>
    </div>
    </>
  );
};

export default Adminscreen;
