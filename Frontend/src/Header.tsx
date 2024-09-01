import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { RootState } from './Store';
import './Css/Admin/notification.css'
import Notificationtab from './Components/Parent/Notificationtab';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { parentApi } from "./Axiosconfig";
import useSocket from './Components/Socket/Usesocket';
import axios from 'axios'


interface CustomNotification {
  message: string;
  bookingDetails: {
    sitterName: string;
  };
  read: boolean;
}



const Header: React.FC = () => {
  const [opensitter, setOpensitter] = useState<boolean>(false);
  const [openparent, setOpenparent] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [profileImageurl, setProfileimageurl] = useState<string>('');
  const [notificationVisible, setNotificationVisible] = useState<boolean>(false);
  const [paiduser, setPaiduser] = useState<boolean>(false)

  const toast = useToast();
  const navigate = useNavigate();
  const socket = useSocket();

  const { parentInfo } = useSelector((state: RootState) => state.parentAuth);
  const parentId = parentInfo?._id;

  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDropdownOpen(!isDropdownOpen);
  };

  const toggleSitter = (event: React.MouseEvent) => {
    event.stopPropagation();
    setOpensitter(!opensitter);
  };

  const toggleParent = (event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenparent(!openparent);
  };

  const toggleNotificationDropdown = () => {
    setNotificationVisible(!notificationVisible);
  };

  const submitChat = () => {
    navigate('/parent/chat')
  }

  useEffect(() => {
    if (socket) {
      console.log('ha');
      socket.on('bookingApproval', (notification: CustomNotification) => {
        const newNotification = { ...notification, read: false };
        setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
        console.log(`Notification sent to parentId ${parentId}:`, newNotification);
      });

      socket.on('bookingRejected', (notification: CustomNotification) => {
        const newNotification = { ...notification, read: false };
        setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
        console.log(`Notification sent to parentId ${parentId}:`, newNotification);
      });


      socket.emit('joinParentRoom', parentId);
      return () => {
        socket.off('bookingApproval');
      };
    }
  }, [socket, parentId]);


  useEffect(() => {
    const fetchProfile = async () => {
      if (!parentInfo?._id) return;

      try {
        const response = await parentApi.get(`/profile/${parentInfo?._id}`);
        setProfileimageurl(response.data.parent.profileImage);
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
  }, [parentInfo, toast]);

  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(false);
    };
    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);


  useEffect(() => {
    const getUser = async () => {
      if (parentInfo) {
        try {
          const response = await parentApi.get(`/get-user/${parentId}`)
          console.log(response.data.userSubscription, 'sub')
          if (response.data.userSubscription.isPaid === true) {
            console.log('true')
            setPaiduser(true)
          }
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
    getUser()
  }, [])

  return (
    <>
      <header className='bg-black/30 z-50'>
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {parentInfo ? (
              <>
                <div className="hidden md:block">
                  <nav aria-label="Global">
                    <ul className="flex items-center gap-6 text-sm">
                      <li key="home">
                        <NavLink
                          className="transition font-mono font-semibold text-lg text-white hover:underline"
                          to="/"
                        >
                          Home
                        </NavLink>
                      </li>
                      <li key="about">
                        <NavLink
                          className="transition font-mono font-semibold text-lg text-white hover:underline"
                          to="#"
                        >
                          About
                        </NavLink>
                      </li>
                      <li key="babysitters">
                        <NavLink
                          className="transition font-mono font-semibold text-lg text-white hover:underline"
                          to="/parent/babysitters"
                        >
                          Babysitters
                        </NavLink>
                      </li>
                      <li key="contact">
                        <NavLink
                          className="transition font-mono font-semibold text-lg text-white hover:underline"
                          to="/contact"
                        >
                          Contact
                        </NavLink>
                      </li>
                    </ul>
                  </nav>
                </div>

                <div className="flex items-center gap-6">
                  <div className="relative flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" onClick={submitChat} style={{ cursor: 'pointer' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>

                    <div className='relative'>
                      <button className="button" onClick={toggleNotificationDropdown}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
                        </svg>
                      </button>
                    </div>
                    {notificationVisible && (
                      <div className="notification-dropdown absolute right-0 top-full mt-2 w-80 bg-white border rounded-md shadow-lg z-10">
                        <Notificationtab notifications={notifications} />
                      </div>
                    )}
                    {!paiduser &&
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                        </svg>
                      </div>
                    }
                    <div>
                      {profileImageurl ? (
                        <img
                          src={profileImageurl}
                          alt="Profile"
                          className="w-10 h-10 rounded-full cursor-pointer object-cover"
                          onClick={toggleDropdown}
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full cursor-pointer bg-gray-200 flex items-center justify-center text-gray-400"
                          onClick={toggleDropdown}
                        />
                      )}

                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                          <ul>
                            <li key="viewProfile">
                              <NavLink
                                to="/parent/viewprofile"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                View Profile
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="hidden md:block">
                  <nav aria-label="Global">
                    <ul className="flex items-center gap-6 text-sm">
                      <li key="home">
                        <Link
                          className="transition font-mono font-semibold text-lg text-white hover:underline"
                          to="/"
                        >
                          Home
                        </Link>
                      </li>
                      <li key="about">
                        <Link
                          className="transition font-mono font-semibold text-lg text-white hover:underline"
                          to="#"
                        >
                          About
                        </Link>
                      </li>
                      <li key="contact">
                        <Link
                          className="transition font-mono font-semibold text-lg text-white hover:underline"
                          to="#"
                        >
                          Contact
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
                <div className="flex items-center gap-4">
                  <div className="sm:flex sm:gap-4">
                    <div className="relative">
                      <div className="inline-flex items-center overflow-hidden rounded-md border bg-white">
                        <a
                          href="#"
                          className="border-e px-4 py-2 font-mono text-sm/none text-sky-800 font-semibold "
                        >
                          Login/register as sitter
                        </a>
                        <button className="h-full p-2 text-black" onClick={toggleSitter}>
                          <span className="sr-only">Menu</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                      {opensitter && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
                          <div
                            className="py-1"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="options-menu"
                          >
                            <Link
                              to="/sitter/sitterregister1"
                              className="block px-4 py-2 font-mono text-sm text-black font-semibold hover:bg-gray-100"
                              role="menuitem"
                            >
                              Register
                            </Link>
                            <Link
                              to="/sitter/sitterlogin"
                              className="block px-4 py-2 font-mono text-sm text-black font-semibold hover:bg-gray-100"
                              role="menuitem"
                            >
                              Login
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <div className="inline-flex items-center overflow-hidden rounded-md border bg-white">
                        <a
                          href="#"
                          className="border-e px-4 py-2 text-sm/none font-mono text-black text-sky-800 font-semibold"
                        >
                          Login/register as parent
                        </a>
                        <button className="h-full p-2 text-black font-mono  font-semibold" onClick={toggleParent}>
                          <span className="sr-only">Menu</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                      {openparent && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
                          <div
                            className="py-1"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby="options-menu"
                          >
                            <a
                              href="/parent/parentregister"
                              className="block px-4 py-2 text-sm font-mono font-semibold text-black hover:bg-gray-100"
                              role="menuitem"
                            >
                              Register
                            </a>
                            <a
                              href="/parent/parentlogin"
                              className="block px-4 py-2 text-sm font-mono font-semibold text-black hover:bg-gray-100"
                              role="menuitem"
                            >
                              Login
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="block md:hidden">
                    <button className="rounded bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75">
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
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
