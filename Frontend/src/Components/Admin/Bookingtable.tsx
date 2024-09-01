import { Box, Button, Flex } from '@chakra-ui/react';
import React, { useState } from 'react';

interface Booking {
    timeSlot: {
        startTime: string;
        endTime: string;
    };
    _id: string;
    sitter: {
        name: string;
    }
    parent: {
        name: string;
    }
    servicepay: string;
    selectedDate: string;
    status: string[];
    isPaid: boolean;
    refundStatus: string[];
    reviewSubmitted: boolean;
    createdAt: string;
    updatedAt: string;
}

interface BookingProps {
    bookings: Booking[];
}

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ITEMS_PER_PAGE = 5;

const Bookingtable: React.FC<BookingProps> = ({ bookings }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);

    const getCurrentPageBookings = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return bookings.slice(startIndex, endIndex);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    return (
        <>
            <Box overflowX="auto" className="p-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sitter</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Pay</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selected Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {getCurrentPageBookings().map((booking) => (
                            <tr key={booking._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking._id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(booking.timeSlot.startTime)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(booking.timeSlot.endTime)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.sitter.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.parent.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.servicepay}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.selectedDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.status.join(', ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.isPaid ? 'Yes' : 'No'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.createdAt).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(booking.updatedAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Box>

            <Flex justifyContent="space-between" mt={4} alignItems="center">
                <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    Previous
                </Button>
                <Box>
                    Page {currentPage} of {totalPages}
                </Box>
                <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                </Button>
            </Flex>
        </>
    );
}

export default Bookingtable;
