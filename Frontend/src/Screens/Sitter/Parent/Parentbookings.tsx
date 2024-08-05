import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useToast } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import Parentlayout from '../../../Components/Parent/Parentlayout';
import { RootState } from '../../../Store'

interface Booking {
  _id: string;
  sitter: {
    name: string;
    profileImage: string;
  };
  selectedDate: string;
  timeSlot: {
    startTime: string;
    endTime: string;
  };
  status: string[];
  review?: {
    rating: number;
    comment: string;
  };
  reviewSubmitted?: boolean
}

const Parentbookings = () => {
  const { parentInfo } = useSelector((state: RootState) => state.parentAuth);
  const parentId = parentInfo?._id;
  const toast = useToast();

  const [view, setView] = useState<string>('Pending');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const itemsPerPage = 10;

  const openModal = (booking: Booking) => {
    console.log(booking, 'book')
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };


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

  useEffect(() => {
    const fetchParentBookings = async () => {
      try {
        const response = await axios.get(`/api/parent/bookings/${parentId}`, {
          params: {
            page: currentPage,
            limit: itemsPerPage,
          },
        });

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

  console.log(rating, review, 'raaa')

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getRatingDescription = (star: number) => {
    switch (star) {
      case 1: return 'Very Poor';
      case 2: return 'Poor';
      case 3: return 'Average';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };


  const handleReviewSubmit = async () => {
    try {
      if (selectedBooking) {
        const response = await axios.post('/api/parent/post-review', {
          rating: rating,
          review: review,
          bookingId: selectedBooking._id
        })
        if (response.status === 200) {
          toast({
            title: 'Success',
            description: 'review added successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top-right',
          });
        }
        const updatedBookings = bookings.map((booking) =>
          booking._id === selectedBooking._id
            ? { ...booking, review: { rating, comment: review }, reviewSubmitted: true }
            : booking
        );
        setBookings(updatedBookings);
      }

    }
    catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(error.response?.data);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'An unknown error occurred',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      } else if (error instanceof Error) {
        console.error(error.message);
        toast({
          title: 'Error',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      } else {
        console.error('An unknown error occurred');
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
    closeModal();
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
                  <td className="text-sm text-gray-900 font-medium px-6 py-4 whitespace-nowrap">
                    {booking.status.includes('Approved') && !booking.review && !booking.reviewSubmitted && (
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => openModal(booking)}
                      >
                        Rate & Review
                      </button>
                    )}
                    {booking.review && booking.reviewSubmitted && (
                      <button
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                        onClick={() => openModal(booking)}
                      >
                        View Review
                      </button>
                    )}
                  </td>
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
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-4">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg mx-auto w-96">
            <h2 className="text-xl font-bold mb-4">Rate & Review</h2>
            <p className="mb-2">{selectedBooking.sitter.name}</p>
            <p className="mb-4">{new Date(selectedBooking.selectedDate).toLocaleDateString()}</p>
            {selectedBooking.review ? (
              <div className="mt-4">
                <h3 className="text-lg mb-2">Your Review</h3>
                <p><strong>Rating:</strong> {Array.from({ length: selectedBooking.review.rating }).map((_, index) => (
                  <FontAwesomeIcon key={index} icon={faStar} className="text-yellow-500" />
                ))}</p>
                <p><strong>Review:</strong> {selectedBooking.review.comment}</p>
                <div className="flex justify-end mt-4">
                  <button
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="rating">
                  <input type="radio" id="star5" name="rating" value="1" className="mask mask-star-2 bg-green-500" onChange={() => setRating(1)} />
                  <label htmlFor="star5" title="Terrible"></label>
                  <input type="radio" id="star4" name="rating" value="2" className="mask mask-star-2 bg-green-500" onChange={() => setRating(2)} />
                  <label htmlFor="star4" title="Bad"></label>
                  <input type="radio" id="star3" name="rating" value="3" className="mask mask-star-2 bg-green-500" onChange={() => setRating(3)} />
                  <label htmlFor="star3" title="OK"></label>
                  <input type="radio" id="star2" name="rating" value="4" className="mask mask-star-2 bg-green-500" onChange={() => setRating(4)} />
                  <label htmlFor="star2" title="Good"></label>
                  <input type="radio" id="star1" name="rating" value="5" className="mask mask-star-2 bg-green-500" onChange={() => setRating(5)} />
                  <label htmlFor="star1" title="Excellent"></label>
                </div>
                <div className="mb-4">
                  <label className="block font-medium">Review</label>
                  <textarea
                    className="w-full border p-2 rounded"
                    rows={5}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleReviewSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


    </Parentlayout>
  );
};

export default Parentbookings;



