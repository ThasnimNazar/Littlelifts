import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type DateSelectInfo = {
    start: Date; 
    startStr: string; 
    end: Date; 
    endStr: string; 
    allDay: boolean; 
  };

interface FullCalendarProps {
    handleDateSelect: (info: DateSelectInfo) => void;
}

const Calendar : React.FC<FullCalendarProps> = ({ handleDateSelect }) =>{
    const today = new Date();
    return (
        <div className="custom-calendar-container">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth" 
                selectable={true} 
                select={handleDateSelect} 
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth',
                }}
                validRange={{
                    start: today
                }}
                
            />
        </div>
    );
}

export default Calendar