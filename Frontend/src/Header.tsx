import { useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from './Store';
import './Css/Admin/notification.css'
import Notificationtab from './Components/Parent/Notificationtab';

const Header: React.FC = () => {
  const [opensitter, setOpensitter] = useState<boolean>(false);
  const [openparent, setOpenparent] = useState<boolean>(false);
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [profileImageurl, setProfileimageurl] = useState<string>('');
  const [notificationVisible, setNotificationVisible] = useState<boolean>(false); 
  const toast = useToast();

  const { parentInfo } = useSelector((state: RootState) => state.parentAuth);

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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!parentInfo?._id) return;

      try {
        const response = await axios.get(`/api/parent/profile/${parentInfo?._id}`);
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

  // Close dropdown when clicking outside
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

  return (
    <>
      <header className="sticky top-0 z-50 shadow bg-white">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {parentInfo ? (
              <>
                <div className="hidden md:block">
                  <nav aria-label="Global">
                    <ul className="flex items-center gap-6 text-sm">
                      <li key="home">
                        <a
                          className="transition font-mono font-semibold text-lg hover:text-black text-sky-800"
                          href="/"
                        >
                          Home
                        </a>
                      </li>
                      <li key="about">
                        <a
                          className="transition hover:text-pink-200 font-mono font-semibold text-lg text-sky-800"
                          href="#"
                        >
                          About
                        </a>
                      </li>
                      <li key="babysitters">
                        <a
                          className="transition font-mono font-semibold text-lg hover:text-black text-sky-800"
                          href="/parent/babysitters"
                        >
                          Babysitters
                        </a>
                      </li>
                      <li key="contact">
                        <a
                          className="transition font-mono font-semibold text-lg hover:text-black text-sky-800"
                          href="#"
                        >
                          Contact
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative flex items-center gap-2">
                    <div className='relative'>
                      <button className="button" onClick={toggleNotificationDropdown}>
                        <svg viewBox="0 0 448 512" className="bell"><path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"></path></svg>
                      </button>
                    </div>
                    {notificationVisible && (
                      <div className="notification-dropdown absolute right-0 top-full mt-2 w-80 bg-white border rounded-md shadow-lg z-10">
                        <Notificationtab />
                      </div>
                    )}
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
                              <a
                                href="/parent/viewprofile"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                View Profile
                              </a>
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
                          className="transition font-mono font-semibold text-lg hover:text-black text-sky-800"
                          to="/"
                        >
                          Home
                        </Link>
                      </li>
                      <li key="about">
                        <Link
                          className="transition hover:text-pink-200 font-mono font-semibold text-lg text-sky-800"
                          to="#"
                        >
                          About
                        </Link>
                      </li>
                      <li key="babysitters">
                        <Link
                          className="transition font-mono font-semibold text-lg hover:text-black text-sky-800"
                          to="/parent/babysitters"
                        >
                          Babysitters
                        </Link>
                      </li>
                      <li key="contact">
                        <Link
                          className="transition font-mono font-semibold text-lg hover:text-black text-sky-800"
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
