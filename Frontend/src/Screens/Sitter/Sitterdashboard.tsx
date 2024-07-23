import { useEffect, useState } from "react";
import { VStack, Text, Spinner, useToast } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Sitterheader from "../../Layouts/Adminlayouts/Sitter/Sitterheader";
import { setSitterCredentials } from "../../Slices/Sitterslice";
import Sitterlayout from "../../Components/Sitter/Sitterlayout";
import { RootState } from "../../Store";
import Rejectionmodal from "../../Components/Sitter/Rejectionmodal";

const SitterDashboard: React.FC = () => {
  const [status, setStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; 

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);
  const sitterId = sitterInfo?._id;

  const [bookings, setBookings] = useState<any[]>([]);

  const handleApprove = async (bookingId: string) => {
    try {
      await axios.post(`/api/sitter/approve-booking/${bookingId}`);
      toast({
        title: 'Booking approved',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      setBookings(bookings.map(booking => booking._id === bookingId ? { ...booking, status: ['Approved'] } : booking));
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
    console.log('heyy')
    console.log(selectedBookingId)
    try {
      if (selectedBookingId) {
      const response = await axios.post(`/api/sitter/reject-booking/${selectedBookingId}`, { reason });
      console.log(response)

        toast({
          title: 'Booking rejected',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
        setBookings(bookings.map(booking => booking._id === selectedBookingId ? { ...booking, status: ['Rejected'] } : booking));
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
        console.log(sitterInfoString)
        if (sitterInfoString) {
          const sitterInfo = JSON.parse(sitterInfoString);
          const response = await axios.get(`/api/sitter/getstatus/${sitterInfo._id}`);
          console.log(response,'status')
          dispatch(setSitterCredentials({ ...response.data.sitter }));
          setStatus(response.data.sitter.verified);
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
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`/api/sitter/bookings/${sitterId}`, {
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
        });
        console.log(response,'ll')
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
    };
    fetchBookings();
  }, [sitterId, currentPage, toast]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    console.log('Current Page:', currentPage);
  }, [currentPage]);

  useEffect(() => {
    console.log('Total Pages:', totalPages);
  }, [totalPages]);

  
  if (loading) {
    return (
      <VStack align="center" margin={10} spacing={4}>
        <Spinner size="xl" />
      </VStack>
    );
  }

  return (
    <>
      {status === false ? (
        <VStack align="center" borderColor="black" margin={10} spacing={4}>
          <Text fontSize="xl" align="center" margin={20} color="red.500" fontWeight="bold">
            Please wait!! Your profile is under verification. You can continue your service until your profile gets verified.
          </Text>
          <Spinner size="xl" />
        </VStack>
      ) : status === true ? (
        <Sitterlayout>
          {bookings.length === 0 ? (
            <VStack align="center" margin={10} spacing={4}>
              <Text fontSize="xl">No bookings yet.</Text>
            </VStack>
          ) : (
            <div className="overflow-x-auto m-10">
              <table className="table">
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
          )}
          <div className="flex justify-center mt-4">
            <button
              title="previous"
              type="button"
              className="inline-flex items-center justify-center w-8 h-8 py-0 border rounded-md shadow"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <span className="mx-2">Page {currentPage} of {totalPages}</span>
            <button
              title="next"
              type="button"
              className="inline-flex items-center justify-center w-8 h-8 py-0 border rounded-md shadow"
              onClick={() => {
                console.log('Next button clicked');
                handlePageChange(currentPage + 1);
              }}
              disabled={currentPage >= totalPages}
            >
              <svg
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </Sitterlayout>
      ) : (
        <VStack align="center" margin={10} spacing={4}>
          <Text fontSize="xl">Unknown status</Text>
        </VStack>
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
