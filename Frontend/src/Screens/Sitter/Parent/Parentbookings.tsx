import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import Parentlayout from '../../../Components/Parent/Parentlayout';

const Parentbookings = () => {
  const { parentInfo } = useSelector((state) => state.parentAuth);
  const parentId = parentInfo?._id;
  const toast = useToast();

  const [view, setView] = useState('Pending');
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchParentBookings = async () => {
      try {
        const response = await axios.get(`/api/parent/bookings/${parentId}`, {
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
        });
        console.log(response,'ll')

        setBookings(response.data.bookings);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        handleAxiosError(error);
      }
    };

    if (parentId) {
      fetchParentBookings();
    }
  }, [parentId, currentPage, toast]);

  const filteredBookings = bookings.filter((booking) => {
    if (view === 'Accepted') {
      return booking.status.includes('Approved');
    } else if (view === 'Rejected') {
      return booking.status.includes('Cancelled');
    } else if (view === 'Pending') {
      return !booking.status.includes('Approved') && !booking.status.includes('Cancelled');
    }
    return false;
  });

  const handleAxiosError = (error) => {
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
  };

  useEffect(() => {
    console.log('Current Page:', currentPage);
  }, [currentPage]);

  useEffect(() => {
    console.log('Total Pages:', totalPages);
  }, [totalPages]);

  const handlePageChange = (newPage) => {
    console.log('Page change requested to:', newPage);
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Parentlayout>
      <div className="m-10">
        <div className="flex justify-center mb-4 space-x-4">
          <span
            className={`cursor-pointer font-mono pb-1 ${view === 'Accepted' ? 'border-b-2 font-mono border-black text-custom-pink' : ''}`}
            onClick={() => setView('Accepted')}
          >
            Accepted
          </span>
          <span
            className={`cursor-pointer font-mono pb-1 ${view === 'Rejected' ? 'border-b-2 font-mono border-black text-custom-pink' : ''}`}
            onClick={() => setView('Rejected')}
          >
            Rejected
          </span>
          <span
            className={`cursor-pointer font-mono pb-1 ${view === 'Pending' ? 'border-b-2 font-mono border-black text-custom-pink' : ''}`}
            onClick={() => setView('Pending')}
          >
            Pending
          </span>
        </div>
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                  #
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                  Sitter
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                  Booked date
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                  Booked time
                </th>
                <th scope="col" className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, index) => (
                <tr key={booking._id}>
                  <td>
                    <div className="avatar">
                      <div className="mask mask-squircle h-12 w-12">
                        <img
                          src={booking.sitter.profileImage || "https://via.placeholder.com/150"}
                          alt="Parent Avatar"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-gray-900 font-medium px-6 py-4 whitespace-nowrap">{booking.sitter.name}</td>
                  <td className="text-sm text-gray-900 font-medium px-6 py-4 whitespace-nowrap">
                    {new Date(booking.selectedDate).toLocaleDateString()}
                  </td>
                  <td className="text-sm text-gray-900 font-medium px-6 py-4 whitespace-nowrap">
                    {new Date(booking.timeSlot.startTime).toLocaleTimeString()} -{' '}
                    {new Date(booking.timeSlot.endTime).toLocaleTimeString()}
                  </td>
                  <td className="text-sm text-gray-900 font-medium px-6 py-4 whitespace-nowrap">{booking.status.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-4">
          <button
            title="previous"
            type="button"
            className="inline-flex items-center justify-center w-8 h-8 py-0 border rounded-md shadow"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4">
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
            disabled={currentPage > totalPages || totalPages === 1}
          >
            <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </Parentlayout>
  );
};

export default Parentbookings;
