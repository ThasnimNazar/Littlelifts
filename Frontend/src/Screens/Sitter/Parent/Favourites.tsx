import Parentlayout from "../../../Components/Parent/Parentlayout";
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../Store';
import { useToast } from '@chakra-ui/react';
import { parentApi } from '../../../Axiosconfig';
import { useNavigate } from "react-router-dom";



interface Favourites {
   name:string;
   email:string;
   phoneno:number;
   profileImage:string;
   _id:string;
}

const Favourites: React.FC = () => {
    const [favourites, setFavourites] = useState<Favourites[]>([]);
    const { parentInfo } = useSelector((state: RootState) => state.parentAuth);

    const parentId = parentInfo?._id;
    const toast = useToast();

    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavourites = async () => {
            try {
                const response = await parentApi.get(`/get-favourites/${parentId}`);
                console.log(response);
                setFavourites(response.data.favourites.sitters);
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
        fetchFavourites();
    }, [parentId, toast]);

    const removeHandler = async(sitterId:string) =>{
        try{
         const response = await parentApi.put(`/remove-favourites/${parentId}`,{
            sitterId
         })
         console.log(response)
    
         setFavourites((prevFavourites) =>
            prevFavourites.filter((favourite) => favourite._id !== sitterId)
          );
        }
        catch (error) {
            toast({
              title: 'Error',
              description: error instanceof Error ? error.message : 'An unknown error occurred',
              status: 'error',
              duration: 3000,
              isClosable: true,
              position: 'top-right',
            });
          }
      }

      const handleProfile = async() =>{
        navigate('/confirmbooking')
      }

    return (
        <>
            <Parentlayout>

                <div className="text-center mb-4">
                    <h3 className="text-2xl font-semibold font-serif">Your Favourites</h3>
                </div>

                {favourites.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 h-36">
                        {favourites.map((favourite, index) => (
                            <div key={index} className="flex items-center bg-gray-200 p-4 rounded-lg shadow-gray-100">
                                <div>
                                    <img className='rounded-full h-12 w-12 object-cover' src={favourite.profileImage} />
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg font-medium">{favourite.name}</h4>
                                    <p className="text-gray-600">{favourite.email}</p>
                                    <p className="text-gray-600">Phone: {favourite.phoneno}</p>
                                </div>
                                <div className="ml-auto flex gap-2">
                                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg" onClick={handleProfile}>
                                       View profile
                                    </button>
                                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg" onClick={()=>removeHandler(favourite?._id)}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                        </svg>

                        <p className="mt-4 text-gray-500">No Favourites Found</p>
                    </div>
                )}
            </Parentlayout>
        </>
    );
};

export default Favourites;
