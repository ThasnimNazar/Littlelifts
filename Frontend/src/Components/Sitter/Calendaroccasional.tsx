import React, { useState } from 'react';
import Calendar from 'react-calendar';
import '../../Css/Admin/Sitter/Fullcalendar.css';

interface CalendarProps {
    handleDateSelect: (info: any) => void;
}


const Calendaroccasional: React.FC<CalendarProps> = ({ handleDateSelect }) => {
    const [date, setDate] = useState(new Date()); 

    const onChange = (newDate:any) => {
        setDate(newDate);
        handleDateSelect(newDate); 
        console.log(newDate,'new')
    };
    const today = new Date();
    return (
        <div className="custom-calendar-container">
            <Calendar
                onChange={onChange}
                value={date}
                selectRange={false} 
                minDate={today}
            />
        </div>
    );
};

export default Calendaroccasional;
