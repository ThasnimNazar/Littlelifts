import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Hero from './Hero';
import Footer from './Footer';
import { RootState } from './Store';
import Sittingcards from './Sittingcards';
import Feature from './Feature';
import Reviews from './ReviewCards';
import { useToast } from '@chakra-ui/react';
import { publicApi } from './Axiosconfig';


interface Location {
  latitude: number;
  longitude: number;
}

interface Babysitter {
  _id: string;
  name: string;
  profileImage: string;
}

const Landscreen = () => {

  const { parentInfo } = useSelector((state: RootState) => state.parentAuth)
  const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth)
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [babysitters, setBabysitter] = useState<Babysitter[]>([]);
  const toast = useToast()



  useEffect(() => {
    const fetchBabysitters = async (latitude: number, longitude: number) => {
      try {
        const response = await publicApi.get(`/api/parent/getsitter`, {
          params: {
            lat: latitude,
            lng: longitude,
            radius: 10,
          }
        });
        console.log(response)
        const { sitters } = response.data;
        setBabysitter(sitters);
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

    if (navigator.geolocation) {
      console.log('heyy')
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchBabysitters(latitude, longitude);
        }
      );
    } else {
      toast({
        title: 'Info',
        description: 'geolocation is not supported by the browser',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, []);


  useEffect(() => {
    if (parentInfo) {
      navigate('/')
    }
    else if (sitterInfo?.verified === true) {
      navigate('/sitter/sitterhome')
    }
  }, [])
  return (
    <>
      <div className='gap-20'>
        {location && <Hero location={location} />}
        <Feature />
        <Sittingcards babysitters={babysitters} />
        <Reviews />
        <Footer />
      </div>
    </>
  );
};

export default Landscreen;
