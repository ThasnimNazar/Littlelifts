import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { useToast } from '@chakra-ui/react';
import '../../Css/Admin/Sitter/Fullcalendar.css';

interface CalendarProps {
    handleDateSelect: (info: any) => void;
}

const Weekendcalendar: React.FC<CalendarProps> = ({ handleDateSelect }) => {
    const toast = useToast();
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const today = new Date();

    const handleDateSelectWrapper = (date: Date) => {
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getUTCDay();

        if (dayOfWeek !== 6 && dayOfWeek !== 5) { 
            toast({
                title: 'Error',
                description: 'Please select only Saturdays or Sundays.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            return;
        }

        if (selectedDates.find(d => d.getTime() === selectedDate.getTime())) {
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

        setSelectedDates([...selectedDates, selectedDate]);
        handleDateSelect({ startStr: selectedDate.toISOString() });
    };

    return (
        <div className="custom-calendar-container">
            <Calendar
                onClickDay={handleDateSelectWrapper}
                tileClassName={({ date }) => {
                    const dayOfWeek = date.getUTCDay();
                    if (dayOfWeek === 6 || dayOfWeek === 5) {
                        return 'weekend-day'; 
                    } else {
                        return 'non-weekend-day';
                    }
                }}
                minDate={today}
            />
        </div>
    );
};

export default Weekendcalendar;
