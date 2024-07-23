import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { AlertIcon, Box, Button, FormControl, FormLabel, Input, Stack, VStack, Alert, Heading, Text, useToast } from '@chakra-ui/react';
import Fullcalendar from './Fullcalendar';
import Header from '../../Header';
import axios from 'axios';

interface RegularSittingProps {
    selectedOptionid: string;
}

const RegularSitting: React.FC <RegularSittingProps> = ({ selectedOptionid }) => {
    const selectedOptionId = selectedOptionid;
    console.log(selectedOptionId,'id')

    const toast = useToast();
    const navigate = useNavigate();
    
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [offDates, setOffDates] = useState<Date[]>([]);
    const today = new Date().toISOString().split('T')[0];

    const handleDateRangeSelect = (info: any) => {
        if (startDate && endDate) {
            toast({
                title: 'Error',
                description: 'Only one month of period can be selected.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            return;
        }

        const { startStr, endStr } = info;
        const startDateObj = new Date(startStr);
        const endDateObj = new Date(endStr);

        console.log('Selected Dates:', { startDateObj, endDateObj });

        setStartDate(startDateObj);
        setEndDate(endDateObj);
    };

    const handleSaveDates = async () => {
        if (!startDate || !endDate || !startTime || !endTime) {
            toast({
                title: 'Error',
                description: 'Please fill in all required fields.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            return;
        }

        if (startTime >= endTime) {
            toast({
                title: 'Error',
                description: 'Starting time should always be less than the ending time.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            return;
        }

        const slotData = {
            startDate,
            endDate,
            startTime,
            endTime,
            offDates
        };
        console.log('slot',slotData)
        
        try {
            const sitterInfoString = localStorage.getItem('sitterinfo');
            if (sitterInfoString) {
                const sitterInfo = JSON.parse(sitterInfoString);
                console.log(sitterInfo._id)
                const response = await axios.put(`/api/sitter/slot-manage/${sitterInfo._id}/${selectedOptionId}`, {
                    selectedOption: 'Regular Sitting',
                    slotData,
                });

                toast({
                    title: 'Success',
                    description: 'Slot created and sitter updated successfully.',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                });

                setStartDate(null);
                setEndDate(null);
                setStartTime(null);
                setEndTime(null);
                setOffDates([]);

                console.log('Response:', response.data);
            }
            navigate('/sitter/documentverify')
        }  catch (error) {
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
        if (offDates.some(offDate => offDate.getTime() === newOffDate.getTime())) {
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

        setOffDates([...offDates, newOffDate]);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<Date | null>>) => {
        const timeStr = e.target.value;
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes);
        setter(date);
    };

    return (
        <>
            <Header />
            <Box display="flex" justifyContent="center" mt={6}>
                <Heading size={40}>
                    <Text as="span" textDecoration="underline" display='inline' borderBottom='2px solid yellow'>
                        Select your available dates and time slots for your service
                    </Text>
                </Heading>
            </Box>
            <Box mt={10} p={4} display="flex" justifyContent='center' style={{ gap: '100px' }}>
                <Fullcalendar handleDateSelect={handleDateRangeSelect} />
                <Box
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    p={4}
                    width="500px"
                    boxShadow="md"
                >
                    {startDate && endDate && (
                        <Stack spacing={3}>
                            <Alert status='info' fontSize={12} fontFamily='serif' fontWeight='bold'>
                                <AlertIcon />
                                You have selected dates from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()} in regular sitting, hence the sitting duration<br />
                                is for 1 month, so please review because this will be your default slot for the service.<br />
                                You can change it only after the registration process.
                            </Alert>
                        </Stack>
                    )}
                    <FormLabel>Select Time Range</FormLabel>
                    <VStack align="start" spacing={4}>
                        <FormControl>
                            <FormLabel>Start Time:</FormLabel>
                            <Input
                                borderColor="black"
                                type="time"
                                focusBorderColor="black"
                                value={startTime ? startTime.toTimeString().substr(0, 5) : ''}
                                onChange={(e) => handleTimeChange(e, setStartTime)}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>End Time:</FormLabel>
                            <Input
                                borderColor="black"
                                type="time"
                                focusBorderColor="black"
                                value={endTime ? endTime.toTimeString().substr(0, 5) : ''}
                                onChange={(e) => handleTimeChange(e, setEndTime)}
                            />
                        </FormControl>
                        <FormControl>
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
                            <Stack spacing={3}>
                                <Alert status='info' fontSize={12} fontFamily='serif' fontWeight='bold'>
                                    <AlertIcon />
                                    You have selected the following off days:
                                    <Text>
                                        {offDates.map((date, index) => (
                                            <React.Fragment key={index}>
                                                {index > 0 && ', '}
                                                {date.toLocaleDateString()}
                                            </React.Fragment>
                                        ))}
                                    </Text>
                                </Alert>
                            </Stack>
                        )}
                        <Button bg="black" color="white" onClick={handleSaveDates}>
                            Save Dates
                        </Button>
                    </VStack>
                </Box>
            </Box>
        </>
    );
};

export default RegularSitting;
