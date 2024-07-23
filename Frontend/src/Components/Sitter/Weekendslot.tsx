import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useToast } from '@chakra-ui/react';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { format, parseISO } from 'date-fns';
import AddSlotModal from './Addslotmodal';
import EditSlotModal from './Editslotmodal';
import '../../Css/Admin/Sitter/Fullcalendar.css';
import '../../Css/Admin/Bigcalendar.css';
import { enUS } from 'date-fns/locale';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse: (str, formatString, locale) => new Date(str),
  startOfWeek: () => new Date(),
  getDay: (date) => date.getDay(),
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

  const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);

  useEffect(() => {
    updateEvents();
  }, [availableDates, offDates]);

  const TIME_FORMAT = 'HH:mm:ss'; // Adjust format as 
  
  const convertToLocalTime = (utcDateString: string, timeZone: string) => {
    const utcDate = new Date(utcDateString);
    return utcDate.toLocaleString('en-US', { timeZone });
  };

  const updateEvents = () => {
    const formattedEvents = availableDates.flatMap((availableDate) =>
      availableDate.timeslots.map((timeslot) => {
        // Convert to user's local time zone
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

    const formattedOffEvents = offDates.map((offDate) => {
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


  
  
  const handleDateSelect = (event: any) => {
    const { start } = event;
    const selected = formatInTimeZone(start, userTimeZone, 'yyyy-MM-dd\'T\'HH:mm:ssXXX');

    const isDateOff = offDates.some((offDate) => {
      const offDateTime = typeof offDate === 'string' ? formatInTimeZone(parseISO(offDate), userTimeZone, 'yyyy-MM-dd\'T\'HH:mm:ssXXX') : new Date(offDate);
      return selected === offDateTime.toDateString();
    });

    if (isDateOff) {
      console.log('Selected date is marked as off.');
    } else {
      setSelectedDate(new Date(selected));
      setShowAddSlotModal(true);
    }
  };

  const handleModalClose = () => {
    setShowAddSlotModal(false);
    setSelectedDate(null);
  };

  const handleEventClick = (event: any) => {
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

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <div className="custom-calendar-container w-full flex justify-center">
      <div className="w-full h-full overflow-hidden">
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
            const style = {
              backgroundColor,
              color: 'white',
            };
            return {
              style,
            };
          }}
        />
      </div>
      {showAddSlotModal && selectedDate && (
        <AddSlotModal
          startDate={selectedDate}
          onClose={handleModalClose}
        />
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
