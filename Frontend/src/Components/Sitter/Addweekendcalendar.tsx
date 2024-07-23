import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useToast } from '@chakra-ui/react';
import '../../Css/Admin/Sitter/Fullcalendar.css';

interface FullCalendarProps {
    handleDateSelect: (info: any) => void;
}

const Addweekendcalendar: React.FC<FullCalendarProps> = ({ handleDateSelect }) => {
    const toast = useToast();
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const today = new Date();

    const handleDateSelectWrapper = (info: any) => {
        const { startStr, start } = info;
        const selectedDate = new Date(start);
        const dayOfWeek = selectedDate.getUTCDay();
        console.log(dayOfWeek,'day')

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

        if (selectedDates.includes(startStr)) {
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

        setSelectedDates([...selectedDates, startStr]);
        handleDateSelect(info);
    };

    return (
        <div className="custom-calendar-container">
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                selectable={true}
                select={handleDateSelectWrapper}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth',
                }}
                dayHeaders={true}
                dayCellClassNames={(args) => {
                    const dayOfWeek = args.date.getUTCDay();
                    if (dayOfWeek === 5 || dayOfWeek === 5) {
                        return 'fc-weekend-day';
                    } else {
                        return 'fc-non-weekend-day';
                    }
                }}
                validRange={{
                    start: today
                }}
            />
        </div>
    );
};

export default Addweekendcalendar;
