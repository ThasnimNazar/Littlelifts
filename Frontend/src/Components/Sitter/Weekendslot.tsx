import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useToast } from '@chakra-ui/react';
import { format } from 'date-fns';
import AddSlotModal from './Addslotmodal';
import EditSlotModal from './Editslotmodal';
import '../../Css/Admin/Sitter/Fullcalendar.css';
import '../../Css/Admin/Bigcalendar.css';
import { enUS } from 'date-fns/locale';


const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse: (str:string) => new Date(str),
  startOfWeek: () => new Date(),
  getDay: (date:Date) => date.getDay(),
  locales,
});

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
}

interface TimeSlot {
  _id: string;
  startTime: string;
  endTime: string;
  error: string | null;
}

interface WeekendData {
  availableDates: {
    date: Date | string;
    timeslots: TimeSlot[];
  }[];
}

interface OffdatesData {
  offDates: Date[] | string[];
}

const Weekendslot: React.FC<WeekendData & OffdatesData> = ({ availableDates, offDates }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddSlotModal, setShowAddSlotModal] = useState<boolean>(false);
  const [editableSlot, setEditableSlot] = useState<TimeSlot | null>(null);
  const [showEditSlotModal, setShowEditSlotModal] = useState<boolean>(false);
  const toast = useToast();


  useEffect(() => {
    updateEvents();
  }, [availableDates, offDates]);


  const convertToLocalTime = (utcDateString: string, timeZone: string) => {
    const utcDate = new Date(utcDateString);
    return utcDate.toLocaleString('en-US', { timeZone });
  };

  const updateEvents = () => {
    const currentDate = new Date();
    currentDate.setDate(1); 
  
    const filteredAvailableDates = availableDates.filter((availableDate) => {
      const date = new Date(availableDate.date);
      return date >= currentDate;
    });
  
    const filteredOffDates = offDates.filter((offDate) => {
      const date = new Date(offDate);
      return date >= currentDate;
    });
  
    const formattedEvents = filteredAvailableDates.flatMap((availableDate) =>
      availableDate.timeslots.map((timeslot) => {
        const startTimeLocal = convertToLocalTime(timeslot.startTime, userTimeZone);
        const endTimeLocal = convertToLocalTime(timeslot.endTime, userTimeZone);
  
        return {
          id: timeslot._id,
          title: 'Available Slot',
          start: new Date(startTimeLocal),
          end: new Date(endTimeLocal),
          allDay: false,
          color: 'green',
        };
      })
    );
  
    const formattedOffEvents = filteredOffDates.map((offDate) => {
      const localDate = new Date(offDate).toLocaleString('en-US', { timeZone: userTimeZone });
  
      return {
        id: `off-${new Date(localDate).getTime()}`,
        title: 'Off',
        start: new Date(localDate),
        end: new Date(localDate),
        allDay: true,
        color: 'red',
      };
    });
  
    setEvents([...formattedEvents, ...formattedOffEvents]);
  };
  




  const handleDateSelect = (slotInfo: { start: Date; end: Date; }) => {
    const { start } = slotInfo;
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); 
    
    if (start < currentDate) {
      toast({
        title: "You cannot select a past date.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
  
    const isDateOff = offDates.some((offDate) => {
      const offDateObj = typeof offDate === 'string' ? new Date(offDate) : offDate;
      return start.toDateString() === new Date(offDateObj).toDateString();
    });
  
    if (isDateOff) {
      toast({
        title: "This date is marked as off.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
  
    setSelectedDate(start);
    setShowAddSlotModal(true);
  };
  
  


  const handleModalClose = () => {
    setShowAddSlotModal(false);
    setSelectedDate(null);
  };

  const handleEventClick = (event: Event) => {
    const { id } = event;
    if (!id.startsWith('off-')) {
      const selectedSlot = findSlotById(id);
      if (selectedSlot) {
        setEditableSlot(selectedSlot);
        setShowEditSlotModal(true);
      } else {
        console.error('Could not find slot with ID:', id);
      }
    } else {
      console.log('Cannot edit an off date.');
    }
  };

  const findSlotById = (id: string) => {
    for (const availableDate of availableDates) {
      for (const timeslot of availableDate.timeslots) {
        if (timeslot._id === id) {
          return timeslot;
        }
      }
    }
    return null;
  };

  const handleEditModalClose = () => {
    setShowEditSlotModal(false);
    setEditableSlot(null);
  };

  

  return (
    <div className="custom-calendar-container w-full flex justify-center">
      <div style={{ width: '90%' }} className="h-full overflow-hidden">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectEvent={handleEventClick}
          onSelectSlot={handleDateSelect} 
          eventPropGetter={(event) => {
            const backgroundColor = event.color || 'green';
            return { style: { backgroundColor, color: 'white' } };
          }}
          views={['month']} 
          popup={true} 
        />
      </div>
      {showAddSlotModal && selectedDate && (
        <>
          {console.log('Rendering AddSlotModal with selected date:', selectedDate)}
          <AddSlotModal
            startDate={selectedDate}
            onClose={handleModalClose}
          />
        </>
      )}
      {showEditSlotModal && editableSlot && (
        <EditSlotModal
          slot={editableSlot}
          existingTimeslots={availableDates.flatMap(date => date.timeslots)}
          onClose={() => {
            handleEditModalClose();
            updateEvents();
          }}
        />
      )}
    </div>
  );
};

export default Weekendslot;
