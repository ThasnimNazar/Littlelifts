import { useEffect, useState } from "react";
import { VStack, Text, Spinner, useToast } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setSitterCredentials } from "../../Slices/Sitterslice";
import { RootState } from "../../Store";
import Rejectionmodal from "../../Components/Sitter/Rejectionmodal";
import Sitterheader from '../../Layouts/Adminlayouts/Sitter/Sitterheader'
import api from '../../Axiosconfig';


interface Reviews {
  _id: string;
  rating: number;
  comment: string;
  parent: {
    name: string;
    profileImage: string;
    email: string;
  }
  createdAt: string;
}

interface Bookings{
  _id:string;
  parent:{
    name:string;
    email:string;
    profileImage:string;

  }
  selectedDate:Date;
  timeSlot:{
    startTime:Date;
    endTime:Date
  }
  status:string;
  isPaid:boolean;
}

const SitterDashboard: React.FC = () => {
  const [status, setStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [reviews, setReviews] = useState<Reviews[]>([])

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);
  const sitterId = sitterInfo?._id;

  const [bookings, setBookings] = useState<Bookings[]>([]);

  const handleApprove = async (bookingId: string) => {
    try {
      await api.post(`/approve-booking/${bookingId}`);
      toast({
        title: 'Booking approved',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      setBookings(bookings.map(booking => booking._id === bookingId ? { ...booking, status: 'Approved' } : booking));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while approving the booking',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const handleReject = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setOpenModal(true);
  };

  const submitRejectionReason = async (reason: string) => {
    try {
      if (selectedBookingId) {
        await api.post(`/reject-booking/${selectedBookingId}`, { reason });
        toast({
          title: 'Booking rejected',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
        setBookings(bookings.map(booking => booking._id === selectedBookingId ? { ...booking, status: 'Rejected' } : booking));
        setOpenModal(false);
        setSelectedBookingId(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while rejecting the booking',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const sitterInfoString = localStorage.getItem('sitterInfo');
        if (sitterInfoString) {
          const sitterInfo = JSON.parse(sitterInfoString);
          const response = await api.get(`/getstatus/${sitterInfo._id}`);
          dispatch(setSitterCredentials({ ...response.data.sitter }));
          setStatus(response.data.sitter.verified);
          setLoading(false);
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
        setLoading(false);
      }
    };
    fetchStatus();
  }, [dispatch, toast]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (sitterId) {
        try {
          const response = await api.get(`/bookings/${sitterId}`, {
            params: {
              page: currentPage,
              limit: itemsPerPage,
            },
          });
          setBookings(response.data.bookings);
          setTotalPages(Math.ceil(response.data.totalBookings / itemsPerPage));
        } catch (error) {
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
    };
    fetchBookings();
  }, [sitterId, currentPage, itemsPerPage, toast]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(`/get-reviews/${sitterId}`)
        console.log(response)
        setReviews(response.data.review)
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
    fetchReviews()
  }, [toast])



  if (loading) {
    return (
      <VStack align="center" margin={10} spacing={4}>
        <Spinner size="xl" />
      </VStack>
    );
  }

  const totalBookings = bookings.length;
  const acceptedBookings = bookings.filter(booking => booking.status[0] === 'Approved').length;
  const rejectedBookings = bookings.filter(booking => booking.status[0] === 'Cancelled').length;
  const pendingBookings = bookings.filter(booking => booking.status[0] === 'Pending').length;




  return (
    <>
      <Sitterheader />
      {status === false ? (
        <VStack align="center" borderColor="black" margin={10} spacing={4}>
          <Text fontSize="xl" align="center" margin={20} color="red.500" fontWeight="bold">
            Please wait!! Your profile is under verification. You can continue your service until your profile gets verified.
          </Text>
          <Spinner size="xl" />
        </VStack>
      ) : status === true ? (
        <>
          {bookings.length === 0 ? (
            <VStack align="center" margin={10} spacing={4}>
              <Text fontSize="xl">No bookings yet.</Text>
            </VStack>
          ) : (
            <>
              <div className="container mx-auto my-10">
                <div className="grid grid-cols-4 gap-10 mb-10">
                  <div className="card bg-base-100 shadow-xl col-span-1">
                    <div className="card-body">
                      <h2 className="card-title text-sky-700 font-medium font-serif">Bookings</h2>
                      <p className="text-lg font-bold">{totalBookings}</p>
                    </div>
                  </div>
                  <div className="card bg-base-100 shadow-xl col-span-1">
                    <div className="card-body">
                      <h2 className="card-title text-sky-700 font-medium font-serif">Pending Bookings</h2>
                      <p className="text-lg font-bold">{pendingBookings}</p>
                    </div>
                  </div>
                  <div className="card bg-base-100 shadow-xl col-span-1">
                    <div className="card-body">
                      <h2 className="card-title text-sky-700 font-medium font-serif">Approved Bookings</h2>
                      <p className="text-lg font-bold">{acceptedBookings}</p>
                    </div>
                  </div>
                  <div className="card1 bg-base-100 shadow-xl col-span-1">
                    <div className="card-body">
                      <h2 className="card-title text-sky-700 font-medium font-serif">Rejected Bookings</h2>
                      <p className="text-lg font-bold">{rejectedBookings}</p>
                    </div>
                  </div>

                </div>
                <div className="grid grid-cols-4 gap-10">
                  <div className="overflow-x-auto col-span-3 ">
                    <table className="table w-full bg-slate-100 shadow-md rounded-lg">
                      <thead>
                        <br></br>
                        <tr className='text-center'>
                          <th colSpan={6} className="text-sky-700 font-semibold font-serif py-2">Your bookings!</th>
                        </tr>
                        <br></br>
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
                                      src={booking.parent.profileImage || "https://via.placeholder.com/150"}
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
                                  {booking.isPaid === false && (
                                    <button
                                      className="btn btn-error btn-xs"
                                      onClick={() => handleReject(booking._id)}
                                    >
                                      Reject
                                    </button>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>

                    </table>
                    <div className="mt-4 flex justify-center">
                      <button className="btn btn-outline mx-1" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Previous
                      </button>
                      <span className="mx-2">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button className="btn btn-outline mx-1" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next
                      </button>
                    </div>
                  </div>
                  <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                      <h2 className="card-title text-sky-700 font-medium font-serif">Recent Ratings & Reviews</h2>
                      <div className="mt-4">
                        { reviews.length > 0 ? (
                          reviews.map(review => (
                            <div key={review._id} className="review-item">
                              <div className="flex items-center mb-2">
                                <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border border-gray-300">
                                  <img
                                    src={review.parent?.profileImage || 'defaultImageUrl.jpg'}
                                    alt={`${review.parent?.name || 'Parent'}'s profile`}
                                    className="w-10 h-10 object-cover"
                                  />
                                </div>
                                <div className="ml-4">
                                  <h3 className="text-lg font-medium text-gray-800">{review.parent?.name}</h3>
                                  <p className="text-sm text-gray-600">{review.parent?.email}</p>
                                </div>
                              </div>
                              <div className="rating">
                                <span className="text-yellow-500 font-semibold">Rating: {review.rating} / 5</span>
                              </div>
                              <div className="comment mt-2">
                                <p className="text-gray-700 font-semibold">review:{review.comment}</p>
                              </div>
                              <div className="date mt-2 text-gray-500 text-sm">
                                <p>Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</p>
                              </div>
                              &nbsp;
                            </div>
                          ))
                        ) : (
                          <p>No reviews yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </>

          )}
        </>
      ) : (
        <Text>Loading...</Text>
      )}
      <Rejectionmodal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={submitRejectionReason}
      />
    </>
  );
};

export default SitterDashboard;
