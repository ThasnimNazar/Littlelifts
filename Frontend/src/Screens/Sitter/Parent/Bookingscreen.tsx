import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';


interface TimeSlot {
    startTime: Date | null;
    endTime: Date | null;
}

const Bookingscreen: React.FC = () => {
    const location = useLocation();
    const { selectedBabysitter } = location.state as { selectedBabysitter: any[] };
    const toast = useToast();
    const sitterId = selectedBabysitter._id;


    const [categoryNames, setCategoryNames] = useState<string[]>([])
    const [dates, setDates] = useState<Date[]>([])
    const [timeSlots, setTimeslots] = useState<{ date: Date; timeslots: TimeSlot[] }[]>([]);
    const [offDates, setOffdates] = useState<Date[]>([])

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
    const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);

    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const itemsPerPage = 3;

    useEffect(() => {
        if (selectedBabysitter && selectedBabysitter.childcategory) {
            console.log('Child Categories:', selectedBabysitter.childcategory);
            const ids = selectedBabysitter.childcategory.map(category => category);
            const fetchCategories = async () => {
                try {
                    const categoryResponse = await axios.post('/api/parent/getnames', {
                        ids: ids
                    })
                    console.log(categoryResponse, 'ggg')
                    setCategoryNames(categoryResponse.data.names)
                }
                catch (error) {
                    handleAxiosError(error);
                }
            }
            fetchCategories()
            console.log(ids, 'kkk');
        }
    }, [selectedBabysitter]);

    console.log(selectedStartTime,'seletime')
    console.log(selectedEndTime,'seleEndtime')

    useEffect(() => {
        const fetchSlots = async () => {
            if (!sitterId) return;

            try {
                const response = await axios.get(`/api/parent/get-slots/${sitterId}`);
                const slotData = response.data.slots[0].availableDates;

                const dates = slotData.map((slot: any) => new Date(slot.date));
                const timeslots = slotData.map((slot: any) => ({
                    date: new Date(slot.date),
                    timeslots: slot.timeslots.map((ts: any) => ({
                        startTime: new Date(ts.startTime),
                        endTime: new Date(ts.endTime),
                        bookingStatus: ts.bookingStatus
                    }))
                }));

                setDates(dates);
                setTimeslots(timeslots);

            } catch (error) {
                handleAxiosError(error);
            }
        };

        fetchSlots();
    }, [sitterId]);

    console.log(dates, 'date')
    console.log(timeSlots, 'time')
    console.log(selectedStartTime,'start time')
    console.log(selectedEndTime,'end time')



    const handleSlotClick = (date: Date, startTime: Date, endTime: Date, status?: 'approved' | 'pending' | 'rejected') => {
        if (status === 'approved' || status === 'rejected') {
            toast({
                title: 'Slot Unavailable',
                description: 'This slot is already booked or rejected.',
                status: 'warning',
                isClosable: true,
            });
            return;
        }

        console.log(date, startTime, endTime, 'laa');
        setSelectedDate(date);
        setSelectedStartTime(startTime);
        setSelectedEndTime(endTime);
        toast({
            title: 'Slot Selected Successfully',
            status: 'success',
            isClosable: true,
        });
    };


    const handleConfirmBooking = async () => {
        if (!selectedDate || !selectedStartTime || !selectedEndTime) {
            toast({
                title: 'Error',
                description: 'Please select a slot',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            return;
        }

        const localStartTime = selectedStartTime.toISOString();
        console.log(localStartTime,'local')
        const localEndTime = selectedEndTime.toISOString();
        console.log(localEndTime,'end')

        try {
            const response = await axios.post(`/api/parent/checkout-session/${sitterId}`, {
                selectedDate,
                startTime: localStartTime,
                endTime: localEndTime,
            });
            console.log(response, 'fff')
            const { session } = response.data;    
            window.location.href = session.url;
        } catch (error) {
            handleAxiosError(error);
        }
    };


    const handleAxiosError = (error: any) => {
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

    const handleNextPage = () => {
        setCurrentPageIndex((prevIndex) => prevIndex + 1);
    };

    const handlePrevPage = () => {
        setCurrentPageIndex((prevIndex) => prevIndex - 1);
    };


    return (
        <section className="w-full overflow-hidden dark:bg-gray-900">
            <div className="flex flex-col bg-gray-100" >
                <div
                    className="bg-gray-300 w-full xl:h-[11rem] lg:h-[9rem] md:h-[7rem] sm:h-[5rem] xs:h-[2rem] object-cover"
                >
                </div>

                <div className="sm:w-[80%] xs:w-[90%] mx-auto flex">

                    {selectedBabysitter.profileImage ? (
                        <img
                            src={selectedBabysitter.profileImage}
                            alt="User Profile"
                            className="rounded-full object-cover lg:w-[14rem] lg:h-[12rem] md:w-[10rem] md:h-[10rem] sm:w-[8rem] sm:h-[8rem] xs:w-[7rem] xs:h-[7rem] outline outline-2 outline-offset-2 outline-blue-500 relative lg:bottom-[5rem] sm:bottom-[4rem] xs:bottom-[3rem]"
                        />
                    ) : (
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Default Profile"
                            className="rounded-full object-cover lg:w-[12rem] lg:h-[12rem] md:w-[10rem] md:h-[10rem] sm:w-[8rem] sm:h-[8rem] xs:w-[7rem] xs:h-[7rem] outline outline-2 outline-offset-2 outline-blue-500 relative lg:bottom-[5rem] sm:bottom-[4rem] xs:bottom-[3rem]"
                        />
                    )}

                    <h1 className="w-full text-left my-4 sm:mx-4 xs:pl-4 text-gray-800 dark:text-white lg:text-2xl md:text-2xl sm:text-2xl xs:text-xl font-mono">
                        {selectedBabysitter.name}
                        <br></br>
                        {selectedBabysitter.yearofexperience} years of experience
                    </h1>
                </div>

                <div className="xl:w-[80%] lg:w-[90%] md:w-[90%] sm:w-[92%] xs:w-[90%] mx-auto flex flex-col gap-4 items-center relative lg:-top-8 md:-top-6 sm:-top-4 xs:-top-4">
                    <p className="w-fit text-black font-mono dark:text-gray-400 text-md">
                        {selectedBabysitter.about}
                    </p>

                    <div className="w-full my-auto py-6 flex flex-col justify-center gap-2">
                        <div className="w-full flex sm:flex-row xs:flex-col gap-2 justify-center">
                            <div className="w-full">
                                <dl className="text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
                                    <div className="flex flex-col pb-3">
                                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Email</dt>
                                        <dd className="text-lg font-semibold">{selectedBabysitter.email}</dd>
                                    </div>
                                    <div className="flex flex-col py-3">
                                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Phone no</dt>
                                        <dd className="text-lg font-semibold">{selectedBabysitter.phoneno}</dd>
                                    </div>
                                    <div className="flex flex-col py-3">
                                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Gender</dt>
                                        <dd className="text-lg font-semibold">{selectedBabysitter.gender}</dd>
                                    </div>
                                </dl>
                            </div>
                            <div className="w-full">
                                <dl className="text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
                                    <div className="flex flex-col pb-3">
                                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Willing to work with pet</dt>
                                        <dd className="text-lg font-semibold">{selectedBabysitter.workwithpet}</dd>
                                    </div>
                                    <div className="flex flex-col pt-3">
                                        <dt className="text-gray-500 md:text-lg dark:text-gray-400">Child categories</dt>
                                        <dd className="text-lg font-semibold">
                                            {categoryNames.map((name, index) => (
                                                <button
                                                    key={index}
                                                    className="bg-gray-200 py-1 px-3 rounded-full text-black font-mono"
                                                >
                                                    {name}
                                                </button>
                                            ))}
                                        </dd>
                                    </div>
                                    <div className="flex flex-col pt-3">
                                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Activities</dt>
                                        <dd className="text-lg font-semibold">{selectedBabysitter.activities.map((activity: string) => (
                                            <button
                                                key={activity}
                                                className="bg-sky-800 py-2 px-4 rounded-full text-white font-mono"
                                            >
                                                {activity}
                                            </button>
                                        ))}</dd>
                                    </div>
                                    <div className="flex flex-col pt-3">
                                        <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">More</dt>
                                        <dd className="text-lg font-semibold">{selectedBabysitter.more.map((option: string) => (
                                            <button
                                                key={option}
                                                className="bg-gray-200 py-2 px-4 rounded-full text-black font-mono"
                                            >
                                                {option}
                                            </button>
                                        ))}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        <div className="card bg-white justify-center my-10 w-full">
                            <div className='m-10'>
                                <h1>Select your slot and confirm booking</h1>
                                {dates.map((date, index) => (
                                    <div key={index} className="my-4">
                                        <h2 className="text-gray-500 mb-2">{date.toLocaleDateString()}</h2>
                                        <div className="flex gap-2">
                                            {timeSlots
                                                .filter((slot) => slot.date.getTime() === date.getTime())
                                                .map((slot) =>
                                                    slot.timeslots
                                                        .slice(
                                                            currentPageIndex * itemsPerPage,
                                                            currentPageIndex * itemsPerPage + itemsPerPage
                                                        )
                                                        .map((timeslot, idx) => (
                                                            <button
                                                                key={idx}
                                                                className={`px-4 py-2 rounded-md ${timeslot.bookingStatus === 'approved' || timeslot.bookingStatus === 'rejected'
                                                                        ? 'bg-gray-500 cursor-not-allowed'
                                                                        : 'bg-black text-white'
                                                                    }`}
                                                                onClick={() => {
                                                                    if (timeslot.bookingStatus !== 'approved' && timeslot.bookingStatus !== 'rejected') {
                                                                        handleSlotClick(slot.date, timeslot.startTime, timeslot.endTime, timeslot.bookingStatus);
                                                                    }
                                                                }}
                                                                disabled={timeslot.bookingStatus === 'approved' || timeslot.bookingStatus === 'rejected'}
                                                            >
                                                                {`${new Date(timeslot.startTime).toLocaleTimeString(
                                                                    [],
                                                                    { hour: 'numeric', minute: '2-digit' }
                                                                )} - ${new Date(timeslot.endTime).toLocaleTimeString(
                                                                    [],
                                                                    { hour: 'numeric', minute: '2-digit' }
                                                                )}`}
                                                            </button>
                                                        ))
                                                )}
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-center mt-4">
                                    {currentPageIndex > 0 && (
                                        <button
                                            className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                                            onClick={handlePrevPage}
                                        >
                                            Previous
                                        </button>
                                    )}
                                    {timeSlots.some(
                                        (slot) =>
                                            slot.timeslots.length > (currentPageIndex + 1) * itemsPerPage
                                    ) && (
                                            <button
                                                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                                                onClick={handleNextPage}
                                            >
                                                Next
                                            </button>
                                        )}
                                </div>
                            </div>
                        </div>

                        <button
                            className="justify-center w-96 mt-4 px-4 py-2 bg-black text-white"
                            onClick={handleConfirmBooking}
                        >
                            Confirm Booking
                        </button>

                    </div>


                </div>
            </div>
        </section>
    );
}

export default Bookingscreen;
