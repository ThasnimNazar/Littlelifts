import { useState, useEffect } from 'react'
import { useToast } from '@chakra-ui/react';
import Bookingtable from './Bookingtable';
import Chart from './Chart';
import '../../Css/Admin/Dashboard.css'
import '../../Css/Admin/Body.css'
import { adminApi } from '../../Axiosconfig';


interface Booking {
    timeSlot: {
        startTime: string;
        endTime: string;
    };
    _id: string;
    sitter: {
        name:string;
    }
    parent: {
        name:string;
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



const Dashboard: React.FC = () => {

    const [bookings, setBookings] = useState<Booking[]>([])
    const toast = useToast();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await adminApi.get('/get-bookings')
                console.log(response)
                setBookings(response.data.bookings)
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
        fetchBookings()
    },[toast])
    return (
        <>
            <div className="dashboard-container flex-1 p-6 bg-gray-100 hide-horizontal-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-2">Accepted Bookings</h2>
                        <p className="text-2xl font-bold">123</p> {/* Replace with dynamic data */}
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-2">Total Bookings</h2>
                        <p className="text-2xl font-bold">456</p> {/* Replace with dynamic data */}
                    </div>
                </div>

                <div>
                 
                    <Chart bookings={bookings} />
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Booking History</h2>
                    <Bookingtable bookings={bookings} />
                    <p>No bookings yet.</p>
                </div>
            </div>
        </>
    )
}

export default Dashboard