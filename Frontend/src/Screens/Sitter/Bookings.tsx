import Sitterlayout from "../../Components/Sitter/Sitterlayout"
import { RootState } from "../../Store"
import { useEffect,useState } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { useToast } from "@chakra-ui/react"

const Bookings: React.FC = () => {
  
    const { sitterInfo } = useSelector((state:RootState)=>state.sitterAuth)
    const sitterId = sitterInfo?._id;

    const [ bookings,setBookings ] = useState<any[]>([])

    const toast = useToast()
    

    useEffect(()=>{
     const fetchBookings = async() =>{
        try{
          const response = await axios.get(`/api/sitter/bookings/${sitterId}`)
          console.log(response,'bookings')
          setBookings(response.data.bookings)
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
     fetchBookings()
    },[])
    return (
        <>
            <Sitterlayout>
                <div className="overflow-x-auto m-10 shadow-md rounded-lg">
                    <table className="table bg-white">
                        <thead>
                            <tr>
                                <th>Parent</th>
                                <th>Parent Email</th>
                                <th>Selected Date</th>
                                <th>Time Slot</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar">
                                                <div className="mask mask-squircle h-12 w-12">
                                                    <img
                                                        src={booking.parent.profileImage || "https://img.daisyui.com/tailwind-css-component-profile-2@56w.png"}
                                                        alt="Parent Avatar"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold">{booking.parent.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{booking.parent.email}</td>
                                    <td>{new Date(booking.selectedDate).toLocaleDateString()}</td>
                                    <td>{`${new Date(booking.timeSlot.startTime).toLocaleTimeString()} - ${new Date(booking.timeSlot.endTime).toLocaleTimeString()}`}</td>
                                    <td>{booking.status[0]}</td>
                                    <td>
                                        {booking.status[0] === 'Pending' && (
                                            <>
                                                <button
                                                    className="btn btn-success btn-xs"
                                                    onClick={() => handleApprove(booking._id)}
                                                >
                                                    Approve
                                                </button>
                                                &nbsp;
                                                <button
                                                    className="btn btn-error btn-xs"
                                                    onClick={() => handleReject(booking._id)}
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Sitterlayout>
        </>
    );
};

export default Bookings