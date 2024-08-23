import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface Booking {
    timeSlot: {
        startTime: string;
        endTime: string;
    };
    _id: string;
    sitter: {
        name: string;
    };
    parent: {
        name: string;
    };
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

const Chart: React.FC<BookingProps> = ({ bookings }) => {
    const chartData = bookings.reduce((acc, booking) => {
        const month = new Date(booking.selectedDate).toLocaleString('default', { month: 'short' });
        
        const existingMonth = acc.find(item => item.month === month);
        
        if (existingMonth) {
            existingMonth.bookings += 1;
        } else {
            acc.push({ month, bookings: 1 });
        }

        return acc;
    }, [] as { month: string; bookings: number }[]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4">Bookings Overview</h2>
            <div className="w-full h-64">
                <LineChart width={600} height={300} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="bookings" stroke="#8884d8" />
                </LineChart>
            </div>
        </div>
    );
};

export default Chart;
