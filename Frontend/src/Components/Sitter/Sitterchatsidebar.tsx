
import React, { useEffect,useState } from 'react';
import '../../Css/Admin/Chat.css'
import { useSelector } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import { RootState } from '../../Store';
import axios from 'axios';
import { sitterApi } from '../../Axiosconfig'



interface Parent {
  _id: string;
  name: string;
  profileImage: string;
  lastMessage: string;
  lastMessagedTime: string;
}

interface ParentResponse {
  parent: {
    _id: string;
    name: string;
    profileImage: string;
  };
  lastMessage: string;
  lastMessagedTime: string;
}

interface ChatsidebarProps {
  onSelectChat: (parent: Parent) => void;
}


const Sitterchatsidebar: React.FC<ChatsidebarProps> = ({ onSelectChat }) => {
  
  const [ bookedparents,setBookedparents ] = useState<Parent[]>([])

  const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth)
  const sitterId = sitterInfo?._id;
  const toast = useToast();



  useEffect(() => {
    const getbabySitter = async () => {
      try {
        const response = await sitterApi.get(`/booked-parents/${sitterId}`) 
        const bookedParentsData: ParentResponse[] = response.data.parent;       
        const bookedParents: Parent[] = bookedParentsData.map((parentObj: ParentResponse) => ({
          _id: parentObj.parent._id,
          name: parentObj.parent.name,
          profileImage: parentObj.parent.profileImage,
          lastMessage: parentObj.lastMessage || 'No messages yet',
          lastMessagedTime: parentObj.lastMessagedTime || '',
        }));
        setBookedparents(bookedParents);
      }
      catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast({
            title: 'Error',
            description: error.response.data.message || 'An unknown error occurred',
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top-right',
          });
        } else {
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
    getbabySitter()
  }, [sitterId])

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <>
      <aside id="nav-menu-1" aria-label="Side navigation" className="fixed top-0 bottom-0 left-0 z-40 flex flex-col transition-transform -translate-x-full bg-white border-r sm:translate-x-0 border-r-slate-200 w-80">
        <div className="relative m-5">
          <input
            id="id-s03"
            type="search"
            name="id-s03"
            placeholder="Search here"
            aria-label="Search content"
            className="peer relative h-10 w-72 rounded border border-slate-200 px-4 pr-12 text-sm text-slate-500 outline-none transition-all autofill:bg-white invalid:border-pink-500 invalid:text-pink-500 focus:border-emerald-500 focus:outline-none invalid:focus:border-pink-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-4 top-2.5 h-5 w-5 cursor-pointer stroke-slate-400 peer-disabled:cursor-not-allowed"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            aria-label="Search icon"
            role="graphics-symbol"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <nav aria-label="side navigation" className="flex-1 overflow-hidden divide-y divide-slate-100">
          <div>
          <ul className="flex flex-col flex-1 gap-1 py-3">
            {bookedparents.map(parent => (
              <li key={parent._id} className="px-3">
                <button
                  onClick={() => onSelectChat(parent)} 
                  className="flex items-center gap-3 p-3 transition-colors rounded text-slate-700 hover:text-sky-500 hover:bg-sky-50 focus:bg-sky-50 aria-[current=page]:text-sky-500 aria-[current=page]:bg-emerald-50 w-full text-left"
                >
                  <img src={parent.profileImage} alt={parent.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex flex-col items-start justify-center flex-1 w-full h-24 gap-0 overflow-hidden text-sm truncate">
                      <span className="font-semibold">{parent.name}</span>
                      <span className="text-gray-500 truncate">
                        {parent.lastMessage || 'No messages yet'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {parent.lastMessagedTime
                          ? formatDateTime(parent.lastMessagedTime)
                          : ''}
                      </span>

                    </div>
                </button>
              </li>
            ))}
          </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sitterchatsidebar;
