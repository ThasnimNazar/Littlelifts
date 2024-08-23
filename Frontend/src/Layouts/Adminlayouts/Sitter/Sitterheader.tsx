import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";
import { RootState } from "../../../Store";
import axios from "axios";
import Notification from "../../../Components/Sitter/Notification";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage } from '@fortawesome/free-regular-svg-icons';
import { useNavigate } from 'react-router-dom'
import { sitterLogout } from "../../../Slices/Sitterslice";
import api from '../../../Axiosconfig'
import useSocket from "../../../Components/Socket/Usesocket";

interface Notifications {
  message: string;
  bookingDetails: {
    selectedDate: string;
    startTime: string;
    endTime: string;
    parentName: string;
  };
  read: boolean;
}

const Sitterheader: React.FC = () => {
  const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const socket = useSocket();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [profileImageurl, setProfileimageurl] = useState<string>('');
  const [notificationVisible, setNotificationVisible] = useState<boolean>(false);
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sitterId = sitterInfo?._id;

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const toggleNotificationDropdown = () => {
    setNotificationVisible(!notificationVisible);
  };

  const submitChat = () => {
    navigate('/sitter/chat')
  }


  useEffect(() => {
    const fetchProfile = async () => {
      if (!sitterInfo?._id) return;

      try {
        const response = await api.get(`/getprofile/${sitterInfo?._id}`);
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

  const handlerLogout = async () => {
    try {
      await api.post('/logout')
      dispatch(sitterLogout())
      navigate('/')
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

  useEffect(() => {
    if (socket) {
      console.log('ha')
      socket.on('bookingNotification', (notification: Notification) => {
        const newNotification = { ...notification, read: false };
        console.log(newNotification, 'new')
        setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
        console.log(`Notification sent to sitterId ${sitterId}:`, newNotification);
      });


      socket.emit('joinBabysitterRoom', sitterId);

      return () => {
        socket.off('bookingNotification');
      };
    }
  }, [socket]);



  console.log(sitterInfo, 'heyy');

  return (
    <header className="sticky inset-0 z-50 h-14 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl gap-8 px-6 transition-all duration-200 ease-in-out lg:px-12 py-4">
        <div className="relative flex items-center">
          {/* <img 
              src={Littelift}
              loading="lazy" 
              width="64" 
              height="64" 
              alt="Target Logo" 
            /> */}
        </div>

        {sitterInfo ? (
          <>
            <ul className="hidden items-center justify-center gap-6 md:flex">
              <li className="pt-1.5 font-dm text-sm font-medium font-serif text-sky-700">
                <a href="/sitter/slot">Slot</a>
              </li>
              <li className="pt-1.5 font-dm text-sm font-medium font-serif text-sky-700">
                <a href="/sitter/viewprofile">Profile</a>
              </li>
            </ul>
            <div className="flex-grow"></div>
            <div className="hidden items-center justify-center gap-6 md:flex">
              <button>
                <FontAwesomeIcon icon={faMessage} onClick={submitChat} />
              </button>
              <div className='relative'>
                <button className="button" onClick={toggleNotificationDropdown}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
                  </svg>
                </button>
              </div>
              {notificationVisible && (
                <div className="notification-dropdown absolute right-0 top-full mt-2 w-80 bg-white border rounded-md shadow-lg z-10">
                  <Notification notifications={notifications} />
                </div>
              )}
              <div className="relative">
                <img
                  src={profileImageurl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover cursor-pointer"
                  onClick={toggleDropdown}
                />
                {dropdownVisible && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handlerLogout}>Logout</a>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-end gap-6">
            <a href="#" className="font-dm text-sm font-medium text-slate-700">Sign in</a>
            <a
              href="#"
              className="rounded-md bg-gradient-to-br from-green-600 to-emerald-400 px-3 py-1.5 font-dm text-sm font-medium text-white shadow-md shadow-green-400/50 transition-transform duration-200 ease-in-out hover:scale-[1.03]"
            >
              Sign up for free
            </a>
          </div>
        )}
        <div className="relative flex items-center justify-center md:hidden">
          <button type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
              className="h-6 w-auto text-slate-900"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
};


export default Sitterheader;
