import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useToast } from '@chakra-ui/react';
import { format } from 'date-fns';
import AddSlotModal from './Addslotmodal';
import EditSlotModal from './Editslotmodal';
import '../../Css/Admin/Sitter/Fullcalendar.css';

interface TimeSlot {
  _id: string; 
  startTime: Date | string;
  endTime: Date | string;
}

interface SpecialcareData {
  availableDates: {
    date: Date | string;
    timeslots: TimeSlot[];
  }[];
}

interface OffdatesData {
  offDates: Date[] | string[];
}



const Specialcareslot: React.FC<SpecialcareData & OffdatesData > = ({ availableDates, offDates }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showAddSlotModal, setShowAddSlotModal] = useState<boolean>(false);
    const [editableSlot, setEditableSlot] = useState<TimeSlot | null>(null);
    const [showEditSlotModal, setShowEditSlotModal] = useState<boolean>(false);
    const toast = useToast();
  
    const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);
  
    useEffect(() => {
      updateEvents();
    }, [availableDates, offDates]);
  
    const updateEvents = () => {
      const formattedEvents = availableDates.flatMap((availableDate) =>
        availableDate.timeslots.map((timeslot) => {
          const startDateTime = typeof timeslot.startTime === 'string' ? new Date(timeslot.startTime) : new Date();
          const endDateTime = typeof timeslot.endTime === 'string' ? new Date(timeslot.endTime) : new Date();
  
          if (!isNaN(startDateTime.getTime()) && !isNaN(endDateTime.getTime())) {
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
          } else {
            console.error('Invalid date format for timeslot:', timeslot);
            return null;
          }
        }).filter(event => event !== null)
      );
  
      const formattedOffEvents = offDates.map((offDate) => ({
        id: `off-${new Date(offDate).getTime()}`, // Unique ID for off dates
        title: 'Off',
        start: format(new Date(offDate), 'yyyy-MM-dd'),
        allDay: true,
        backgroundColor: 'red',
      }));
  
      setEvents([...formattedEvents, ...formattedOffEvents]);
    };
  
    const handleDateSelect = (selectInfo: any) => {
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

    const handleSelectAllow = (selectInfo: any) => {
        return true; // Allow selection on all days
      }
  
    const handleModalClose = () => {
      setShowAddSlotModal(false);
      setSelectedDate(null);
    };
  
    const handleEventClick = (clickInfo: any) => {
      const { event } = clickInfo;
      const { id, start, end } = event;
  
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
}

export default Specialcareslot