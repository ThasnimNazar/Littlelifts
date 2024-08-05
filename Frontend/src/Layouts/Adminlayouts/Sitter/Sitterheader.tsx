import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { RootState } from "../../../Store";
import axios from "axios";
import Notification from "../../../Components/Sitter/Notification";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage } from '@fortawesome/free-regular-svg-icons';
import { useNavigate } from 'react-router-dom'

const Sitterheader: React.FC = () => {
  const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profileImageurl, setProfileimageurl] = useState<string>('');
  const [notificationVisible, setNotificationVisible] = useState<boolean>(false); 
  const toast = useToast();
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const toggleNotificationDropdown = () => {
    setNotificationVisible(!notificationVisible);
  };

  const submitChat = () =>{
    navigate('/sitter/chat')
  }

  

  useEffect(() => {
    const fetchProfile = async () => {
      if (!sitterInfo?._id) return;

      try {
        const response = await axios.get(`/api/sitter/getprofile/${sitterInfo?._id}`);
        setProfileimageurl(response.data.sitter.profileImage);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      }
    };
    fetchProfile();
  }, [sitterInfo, toast]);


  console.log(sitterInfo, 'heyy');

  return (
    <>
      <header className="sticky top-0 z-50 shadow bg-white" style={{ position: 'sticky' }}>
        <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-4">
              {!sitterInfo && (
                <>
                  <div className="sm:flex sm:gap-4">
                    <a
                      className="block rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
                      href="#"
                    >
                      Login
                    </a>
                    <a
                      className="hidden rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-teal-600 transition hover:text-teal-600/75 sm:block"
                      href="#"
                    >
                      Register
                    </a>
                  </div>
                  <button
                    className="block rounded bg-gray-100 p-2.5 text-gray-600 transition hover:text-gray-600/75 md:hidden"
                  >
                    <span className="sr-only">Toggle menu</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            {sitterInfo && (
              <div className="flex items-center gap-4 ml-auto relative">
                <div>
                    <FontAwesomeIcon icon={faMessage}  style={{height:'25px',cursor:'pointer'}} onClick={submitChat} />
                    </div>
                <div className='relative'>
                  <button className="button" onClick={toggleNotificationDropdown}>
                    <svg viewBox="0 0 448 512" className="bell"><path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"></path></svg>
                  </button>
                </div>
                {notificationVisible && (
                    <div className="notification-dropdown absolute right-0 top-full mt-2 w-80 bg-white border rounded-md shadow-lg z-10">
                      <Notification />
                    </div>
                  )}
                <div className="relative">
                  <div className="avatar cursor-pointer relative" onClick={toggleDropdown}>
                    <div className="ring-offset-base-100 w-12 rounded-full overflow-hidden">
                      {profileImageurl ? (
                        <img
                          src={profileImageurl}
                          alt="Profile"
                          className="w-10 h-10 rounded-full cursor-pointer object-cover"
                          onClick={toggleDropdown}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full cursor-pointer bg-gray-200 flex items-center justify-center text-gray-400" alt='No Image' onClick={toggleDropdown}>
                        </div>
                      )}
                    </div>
                  </div>
                  {dropdownVisible && (
                    <div className="absolute right-3 top-full mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50">
                      <a href="/sitter/viewprofile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View Profile</a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Sitterheader;
