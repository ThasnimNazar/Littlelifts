import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { parentLogout } from "../../Slices/Parentslice";
import { NavLink } from 'react-router-dom';
import { parentApi } from "../../Axiosconfig";

const Parentsidemenu : React.FC = () =>{

    const dispatch = useDispatch()
    const navigate = useNavigate();
    const toast = useToast()

    const handleLogout = async () => {
        try {
            await parentApi.post('/logout')
            localStorage.removeItem('parentToken')
            localStorage.removeItem('parentRole')
            dispatch(parentLogout());
            navigate('/');
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
    return(
        <>
         <div className="hidden min-h-screen md:flex flex-col w-64 bg-white text-black border-r" style={{borderColor:"gray",borderRadius:'2px'}}>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 bg-white-800 text-black">
            <NavLink to ="/parent/booking" className="flex items-center px-4 py-2 mt-2 h-20 font-mono semibold  text-sky-800 hover:bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
              Your bookings
            </NavLink>
            <NavLink to ="/parent/favourites" className="flex items-center px-4 py-2 mt-2 h-20 font-mono semibold text-sky-800 hover:bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
              </svg>
              Favourites
            </NavLink>
            <button onClick={handleLogout} className="flex items-center px-4 py-2 mt-2 h-20 w-full font-semibold font-mono rounded-sm text-sky-800 aling-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Logout
            </button>
          </nav>
        </div>
      </div>
        </>
    )
}

export default Parentsidemenu