import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertIcon, Box, Button, FormControl, FormLabel, Input, Stack, VStack, Alert, Heading, Text, useToast } from '@chakra-ui/react';
import Calendaroccasional from './Calendaroccasional';
import Header from '../../Header';
import { sitterApi } from '../../Axiosconfig'

interface SpecialcareSittingProps {
    selectedOptionid: string;
}

interface TimeSlot {
    startTime: Date | null;
    endTime: Date | null;
    error: string | null;
}

const newTimeSlot: TimeSlot = {
    startTime: null,
    endTime: null,
    error: null,
};

interface DateSelectInfo {
    startStr: string;
    endStr: string;
    allDay: boolean;
    start: Date;
    end: Date;
}

const Specialcaresitting: React.FC<SpecialcareSittingProps> = ({ selectedOptionid }) => {
    const selectedOptionId = selectedOptionid;

    const [availableDates, setAvailableDates] = useState<{ date: Date; timeslots: TimeSlot[] }[]>([]);
    const [offDates, setOffDates] = useState<Date[]>([]);
    const toast = useToast();
    const navigate = useNavigate();
    const today = new Date().toISOString().split('T')[0];

    const handleDateSelect = (info: DateSelectInfo) => {
        const selectedDate = new Date(info.startStr);
        if (availableDates.some(date => date.date.getTime() === selectedDate.getTime())) {
            toast({
                title: 'Info',
                description: 'You have already selected this date.',
                status: 'info',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            return;
        }
        setAvailableDates(prevDates => [...prevDates, { date: selectedDate, timeslots: [] }]);
    };

    const validateTimeSlot = (startTime: Date | null, endTime: Date | null) => {
        if (!startTime || !endTime) {
            return 'Please fill in both start and end times.';
        }

        if (startTime >= endTime) {
            return 'End time must be after start time.';
        }

        return null;
    };

    const handleAddSlot = (dateIndex: number) => {
        const updatedDates = [...availableDates];
        updatedDates[dateIndex].timeslots.push({ ...newTimeSlot }); 
        setAvailableDates(updatedDates);
    };

    const handleTimeChange = (
        dateIndex: number,
        slotIndex: number,
        type: 'startTime' | 'endTime',
        value: string
    ) => {
        const newTimeSlots = [...availableDates];
        const [hours, minutes] = value.split(':').map(Number);
        const date = new Date(newTimeSlots[dateIndex].date);
        date.setHours(hours, minutes, 0, 0);
    
        const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        newTimeSlots[dateIndex].timeslots[slotIndex][type] = utcDate;
    
        const { startTime, endTime } = newTimeSlots[dateIndex].timeslots[slotIndex];
    
        const validationError = validateTimeSlot(startTime, endTime);
        newTimeSlots[dateIndex].timeslots[slotIndex].error = validationError;
    
        if (!validationError) {
            const overlappingSlot = newTimeSlots[dateIndex].timeslots.find((slot, i) => {
                if (i !== slotIndex) {
                    const slotStart = slot.startTime;
                    const slotEnd = slot.endTime;
                    const start = startTime;
                    const end = endTime;
    
                    if (start == null || end == null || slotStart == null || slotEnd == null) {
                        return false;
                    }
    
                    const startOverlap = start >= slotStart && start < slotEnd;
                    const endOverlap = end > slotStart && end <= slotEnd;
                    const encompasses = start <= slotStart && end >= slotEnd;
    
                    return startOverlap || endOverlap || encompasses;
                }
                return false;
            });
    
            if (overlappingSlot) {
                newTimeSlots[dateIndex].timeslots[slotIndex].error = 'Time slots cannot overlap on the same date.';
            }
        }
    
        setAvailableDates(newTimeSlots);
    };

    const handleSaveDates = async () => {
        if (!availableDates.length) {
            toast({
                title: 'Error',
                description: 'Please select at least one date.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            return;
        }

        let allSlotsFilled = true;
        availableDates.forEach(date => {
            if (!date.timeslots || date.timeslots.length === 0) {
                allSlotsFilled = false;
                return;
            }
            date.timeslots.forEach(slot => {
                if (!slot || !slot.startTime || !slot.endTime) {
                    allSlotsFilled = false;
                    return;
                }
            });
        });

        if (!allSlotsFilled) {
            toast({
                title: 'Error',
                description: 'Please fill in all time slots.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            return;
        }

        if (!offDates.length) {
            toast({
                title: 'Error',
                description: 'Please select at least one off day.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            return;
        }

        const formattedAvailableDates = availableDates.map(date => ({
            date: new Date(date.date.getTime() - (date.date.getTimezoneOffset() * 60000)).toISOString().split('T')[0],
            timeslots: date.timeslots.map(slot => ({
                startTime: slot.startTime ? slot.startTime.toISOString() : null,
                endTime: slot.endTime ? slot.endTime.toISOString() : null,
            })),
        }));

        const slotData = {
            availableDates: formattedAvailableDates,
            offDates: offDates.map(date => new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0]),
        };

        console.log(slotData,'slot')

        try {
            const sitterInfoString = localStorage.getItem('sitterInfo');
            if (sitterInfoString) {
                const sitterInfo = JSON.parse(sitterInfoString);
                const response = await sitterApi.put(
                    `/slot-manage/${sitterInfo._id}/${selectedOptionId}`,
                    {
                        selectedOption: 'Weekend Sitting',
                        slotData,
                    }
                );

                toast({
                    title: 'Success',
                    description: 'Slots created and sitter updated successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                });

                setAvailableDates([]);
                setOffDates([]);

                console.log('Response:', response.data);
            }
            navigate('/sitter/documentverify');
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'An unknown error occurred',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
        }
    };

    const handleAddOffDay = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newOffDate = new Date(e.target.value);

        const dates = availableDates.map(dateObj => dateObj.date);
        console.log(dates)

        const overlapsWithAvailableDate = availableDates.some(dateObj => {
            const date1 = new Date(dateObj.date);
            const date2 = new Date(newOffDate);
            date1.setHours(0, 0, 0, 0);
            date2.setHours(0, 0, 0, 0);
            return date1.getTime() === date2.getTime();
        });

        if (overlapsWithAvailableDate) {
            toast({
                title: 'Error',
                description: 'Selected off day cannot overlap with available dates.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            return;
        }

        const exists = offDates.some(date => date.getTime() === newOffDate.getTime());
        if (exists) {
            toast({
                title: 'Info',
                description: 'You have already selected this date as an off day.',
                status: 'info',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            return;
        }

        setOffDates([...offDates, newOffDate]);
    };

    return (
        <>
            <Header />
            <Box className="flex justify-center mt-6">
                <Heading size="xs">
                    <Text as="span" className="underline inline border-b-2 border-yellow-400">
                        Select your available dates and time slots for your service
                    </Text>
                </Heading>
            </Box>
            <Box className="mt-10 p-4 flex justify-center">
                <Calendaroccasional handleDateSelect={handleDateSelect} />
            </Box>
            <Box className="mt-6 p-4 flex justify-center">
                <Box className="border-1 border-gray-200 rounded-md p-4 w-500 shadow-md">
                    {availableDates.length > 0 && (
                        <Stack spacing={3}>
                            <Alert status="info" fontSize={12} fontFamily="serif" fontWeight="bold">
                                <AlertIcon />
                                You have selected the following dates for your service,
                                <Text>
                                    {availableDates.map((date, index) => (
                                        <React.Fragment key={index}>
                                            {index > 0 && ', '}
                                            {date.date.toLocaleDateString()}
                                        </React.Fragment>
                                    ))}
                                </Text>
                            </Alert>
                        </Stack>
                    )}
                    {availableDates.map((date, dateIndex) => (
                        <VStack key={dateIndex} align="start" spacing={4} mt={4} borderWidth="1px" borderRadius="lg" p={4}>
                            <FormLabel>Select Time Slots for {date.date.toLocaleDateString()}</FormLabel>
                            {date.timeslots.map((slot, slotIndex) => (
                                <Box key={slotIndex} borderWidth="1px" borderRadius="lg" p={4} width="100%">
                                    <FormControl isInvalid={!!slot.error}>
                                        <FormLabel>Start Time:</FormLabel>
                                        <Input
                                            borderColor="black"
                                            type="time"
                                            focusBorderColor="black"
                                            value={slot.startTime ? slot.startTime.toISOString().substr(11, 5) : ''}
                                            onChange={(e) => handleTimeChange(dateIndex, slotIndex, 'startTime', e.target.value)}
                                        />
                                        <br></br>
                                        {slot.error && (
                                            <Alert status="error" fontSize={12} fontFamily="serif">
                                                <AlertIcon />
                                                {slot.error}
                                            </Alert>
                                        )}
                                    </FormControl>
                                    <FormControl isInvalid={!!slot.error} mt={2}>
                                        <FormLabel>End Time:</FormLabel>
                                        <Input
                                            borderColor="black"
                                            type="time"
                                            focusBorderColor="black"
                                            value={slot.endTime ? slot.endTime.toISOString().substr(11, 5) : ''}
                                            onChange={(e) => handleTimeChange(dateIndex, slotIndex, 'endTime', e.target.value)}
                                        />
                                        <br></br>
                                        {slot.error && (
                                            <Alert status="error" fontSize={12} fontFamily="serif">
                                                <AlertIcon />
                                                {slot.error}
                                            </Alert>
                                        )}
                                    </FormControl>
                                </Box>
                            ))}
                            <Button onClick={() => handleAddSlot(dateIndex)} className="bg-black text-white">Add Time Slot</Button>
                        </VStack>
                    ))}
                    <FormControl mt={4}>
                        <FormLabel>Add Off Day:</FormLabel>
                        <Input
                            borderColor="black"
                            type="date"
                            focusBorderColor="black"
                            onChange={handleAddOffDay}
                            min={today}
                        />
                    </FormControl>
                    {offDates.length > 0 && (
                        <Stack spacing={3} mt={4}>
                            <Alert status="info" fontSize={12} fontFamily="serif" fontWeight="bold">
                                <AlertIcon />
                                You have selected the following off days:
                                <Text>
                                    {offDates.map((offDate, index) => (
                                        <React.Fragment key={index}>
                                            {index > 0 && ', '}
                                            {offDate.toLocaleDateString()}
                                        </React.Fragment>
                                    ))}
                                </Text>
                            </Alert>
                        </Stack>
                    )}
                    <Button onClick={handleSaveDates} className="mt-4 bg-black text-white">Save Dates</Button>
                </Box>
            </Box>
        </>
    );
};

export default Specialcaresitting;
