import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react';
import api from '../../Axiosconfig'

interface AvailabilityCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  babysitterId: string;
}

type CalendarEvent = {
  title: string;
  start: string | Date;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
};

const AvailabilityCalendar:React.FC<AvailabilityCalendarProps> = ({ isOpen, onClose, babysitterId }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        console.log(babysitterId,'id')
        const response = await api.get(`/get-availabledates/${babysitterId}`);
        console.log(response)
        const { availableDates, offDates } = response.data;
        console.log(availableDates,offDates)

        const availabilityEvents: CalendarEvent[] = availableDates.map((dateObj: string) => ({
          title: 'Available',
          start: dateObj,
          allDay: true,
          backgroundColor: 'green',
          borderColor: 'green',
        }));

        console.log(availabilityEvents)

        const offEvents: CalendarEvent[] = offDates.map((date: string) => ({
          title: 'Not Available',
          start: date, 
          allDay: true, 
          backgroundColor: 'red',
          borderColor: 'red',
        }));

        setEvents([...availabilityEvents, ...offEvents]);
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    if (isOpen) {
      fetchAvailability();
    }
  }, [isOpen, babysitterId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Availability Calendar</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            events={events}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            dayMaxEventRows={true} 
            dayMaxEvents={1} 
            eventDisplay="block" 
            eventTextColor="white" 
            editable={false}
            selectable={false} 
            eventClick={() => false} 
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AvailabilityCalendar;
