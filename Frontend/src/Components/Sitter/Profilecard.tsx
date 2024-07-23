import React from 'react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { useToast } from '@chakra-ui/react';
import Editprofile from './Editprofile';
import Sitterheader from '../../Layouts/Adminlayouts/Sitter/Sitterheader';

const Profilecard: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneno, setPhoneno] = useState<number>(0);
  const [gender, setGender] = useState<string>('');
  const [yearofexperience, setYearofexperience] = useState<number>(0)
  const [workwithpet, setWorkwithpet] = useState<string>('')
  const [maxchildren, setMaxchildren] = useState<number>(0)
  const [childcategory, setChildcategory] = useState<string[]>([])
  const [servicepay, setServicepay] = useState<number>(0)
  const [about, setAbout] = useState<string>('')
  const [childCategoryNames, setChildCategoryNames] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false); 

  const toast = useToast();

  const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);
  console.log(sitterInfo);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`/api/sitter/getprofile/${sitterInfo._id}`);
        console.log(response);
        if (response.data) {
          setName(response.data.sitter.name);
          setEmail(response.data.sitter.email);
          setPhoneno(response.data.sitter.phoneno);
          setGender(response.data.sitter.gender);
          setMaxchildren(response.data.sitter.maxchildren)
          setYearofexperience(response.data.sitter.yearofexperience)
          setWorkwithpet(response.data.sitter.workwithpet)
          setServicepay(response.data.sitter.servicepay)
          setAbout(response.data.sitter.about)
          fetchChildCategoryNames(response.data.sitter.childcategory);
        }
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
    fetchDetails();
  }, [sitterInfo._id, toast]);

  const fetchChildCategoryNames = async (categoryIds: string[]) => {
    try {
      const response = await axios.post('/api/sitter/getnames',
        { ids: categoryIds }
      );
      console.log(response)
      if (response.data && response.data.names) {
        setChildCategoryNames(response.data.names);
      }
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

  if (isEditing) {
    return <Editprofile />; 
  }


  return (
    <>
    <div className="relative" style={{ width: '100%', marginTop: '80px', borderColor: 'black', borderRadius: '5px' }}>
      <div className="rounded overflow-hidden shadow-md bg-white">
        <div className="absolute -mt-20 w-full flex justify-center">
          <div className="h-32 w-32">
            <img
              src=""
              className="rounded-full object-cover h-full w-full shadow-md"
              alt="Profile"
            />
          </div>
        </div>
        <div className="px-6 mt-16">
          <h1 className="font-bold text-lg text-center mb-1"><span className='font-bold text-yellow-400'>Name: </span>{name}</h1>
          <h1 className="text-black text-lg text-center font-semibold mb-1"><span className='font-bold text-yellow-400'>Email: </span>{email}</h1>
          <h1 className="text-center text-lg text-black font-semibold mb-1"><span className='font-bold text-yellow-400'>phone no: </span> {phoneno}</h1>
          <h1 className="text-black text-lg text-center font-semibold mb-1"><span className='font-bold text-yellow-400'>Gender: </span> {gender}</h1>
          <h1 className="text-black text-lg  text-center font-semibold mb-1"><span className='font-bold text-yellow-400'>year of experience: </span>{yearofexperience}</h1>
          <h1 className="text-black text-lg text-center font-semibold mb-1"><span className='font-bold text-yellow-400'>Do you work with pet: </span>{workwithpet}</h1>
          <h1 className="text-black text-lg text-center font-semibold mb-1"><span className='font-bold text-yellow-400'>Child Categories you have experience with: </span>{childCategoryNames.join(', ')}</h1>
          <h1 className="text-black text-lg text-center font-semibold mb-1"><span className='font-bold text-yellow-400'>Max children you watch :</span>{maxchildren}</h1>
          <h1 className="text-black text-lg text-center font-semibold mb-1"><span className='font-bold text-yellow-400'>Service fee: </span>${servicepay}</h1>
          <h1 className="text-black text-lg text-center font-semibold mb-1"><span className='font-bold text-yellow-400'>About: </span>{about}</h1>
        </div>
        <br></br>
        <div className="px-10 flex justify-center">
          <button className='bg-black text-white rounded-sm w-32' style={{height:'50px'}} onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
        <br></br>
      </div>
    </div>
    </>
  );
};

export default Profilecard;
