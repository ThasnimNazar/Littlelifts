import './Css/Admin/Body.css';
import Header from './Header';
import './Css/Admin/Landscreen.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';


interface Location {
  latitude: number;
  longitude: number;
}


interface HeroProps {
  location: Location;
}

const Hero: React.FC<HeroProps> = ({ location }) => {

  const navigate = useNavigate()

  const handleSubscription = () => {
    navigate('/parent/parentregister')
  }

  return (
    <div className="common-background relative h-[550px] bg-cover"style={{backgroundImage:"url(https://joinbubble.com/wp-content/uploads/2023/01/Olivia-2048x1365.webp)"}}>
        <div className = "header-wrapper" >
          <Header />
      </div >
  <div className="inner-content mt-20 gap-10">
    <div className="card h-14 flex items-center overflow-hidden bg-white rounded shadow-md text-slate-500 w-64 p-2">
      <FontAwesomeIcon icon={faLocationDot} className="text-xl mr-4" />
      <div className="flex flex-1 items-center">
        <p>{location ? `${location.latitude}, ${location.longitude}` : "Fetching location..."}</p>
      </div>
    </div>
    <div className='mt-5'>
      <button className='bg-black w-32 h-10 text-white font-serif' onClick={handleSubscription}>View More</button>
    </div>
  </div>
    </div >
  );
};



export default Hero;
