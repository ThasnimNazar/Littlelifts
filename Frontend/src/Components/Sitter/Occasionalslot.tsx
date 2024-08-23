import {  DateSelectArg, EventClickArg,DateSpanApi } from '@fullcalendar/core'; // Use core package for types
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState, useEffect } from 'react';
import AddSlotModal from './Addslotmodal';
import EditSlotModal from './Editslotmodal';
import { format } from 'date-fns';


interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  color?: string;
  allDay?: boolean;
}




interface TimeSlot {
  _id: string;
  startTime: string;
  endTime: string;
  error: string | null;
}


interface OccasionalData {
  availableDates: {
    date: Date | string;
    timeslots: TimeSlot[];
  }[];
}

interface OffdatesData {
  offDates: Date[] | string[];
}

const Occasionalslot: React.FC<OccasionalData & OffdatesData> = ({ availableDates, offDates }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddSlotModal, setShowAddSlotModal] = useState<boolean>(false);
  const [editableSlot, setEditableSlot] = useState<TimeSlot | null>(null);
  const [showEditSlotModal, setShowEditSlotModal] = useState<boolean>(false);
 

  useEffect(() => {
    updateEvents();
  }, [availableDates, offDates]);

  const updateEvents = () => {
    const formattedEvents = availableDates.flatMap((availableDate) =>
      availableDate.timeslots.map((timeslot) => {
        const startDateTime = new Date(timeslot.startTime);
        const endDateTime = new Date(timeslot.endTime);

        startDateTime.setFullYear(new Date(availableDate.date).getFullYear());
        startDateTime.setMonth(new Date(availableDate.date).getMonth());
        startDateTime.setDate(new Date(availableDate.date).getDate());

        endDateTime.setFullYear(new Date(availableDate.date).getFullYear());
        endDateTime.setMonth(new Date(availableDate.date).getMonth());
        endDateTime.setDate(new Date(availableDate.date).getDate());

        return {
          id: timeslot._id,
          title: 'Available Slot',
          start: startDateTime,
          end: endDateTime,
          color: 'green',
        };
      })
    );

    const formattedOffEvents = offDates.map((offDate) => ({
      id: `off-${new Date(offDate).getTime()}`,
      title: 'Off',
      start: format(new Date(offDate), 'yyyy-MM-dd'),
      allDay: true,
      backgroundColor: 'red',
    }));

    setEvents([...formattedEvents, ...formattedOffEvents]);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const { start } = selectInfo;
    const selected = new Date(start);

    const isDateOff = offDates.some((offDate) => {
      const offDateTime = typeof offDate === 'string' ? new Date(offDate) : offDate;
      return selected.toDateString() === offDateTime.toDateString();
    });

    if (isDateOff) {
      console.log('Selected date is marked as off.');
    } else {
      setSelectedDate(selected);
      setShowAddSlotModal(true);
    }
  };

  const handleSelectAllow = (selectInfo: DateSpanApi) => {
    console.log(selectInfo)
    return true;
  };

  const handleModalClose = () => {
    setShowAddSlotModal(false);
    setSelectedDate(null);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const { event } = clickInfo;
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

  const findExistingDate = (selectedDate: Date) => {
    return availableDates.find(
      (availableDate) => new Date(availableDate.date).toDateString() === selectedDate.toDateString()
    );
  };

  useEffect(() => {
    console.log('selectedDate:', selectedDate);
    console.log('findExistingDate:', findExistingDate(selectedDate ?? new Date()));
  }, [selectedDate]);

  return (
    <div className="custom-calendar-container w-full flex justify-center">
      <div className="w-full h-full overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventBackgroundColor="green"
          eventTextColor="white"
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          selectAllow={handleSelectAllow}
          validRange={{
            start: new Date(),
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
          existingTimeslots={availableDates.flatMap((date) => date.timeslots)}
          onClose={() => {
            handleEditModalClose();
            updateEvents();
          }}
        />
      )}
    </div>
  );
};

export default Occasionalslot;
