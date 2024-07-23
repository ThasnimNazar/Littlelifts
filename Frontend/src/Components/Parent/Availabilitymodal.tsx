import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const AvailabilityCalendar = ({ isOpen, onClose, babysitterId }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        console.log(babysitterId,'id')
        const response = await axios.get(`/api/parent/get-availabledates/${babysitterId}`);
        console.log(response)
        const { availableDates, offDates } = response.data;
        console.log(availableDates,offDates)

        const availabilityEvents = availableDates.map(dateObj => ({
          title: 'Available',
          start: dateObj,
          allDay: true,
          backgroundColor: 'green',
          borderColor: 'green',
        }));

        console.log(availabilityEvents)

        const offEvents = offDates.map(date => ({
          title: 'Not Available',
          start: date, 
          allDay: true, 
          backgroundColor: 'red',
          borderColor: 'red',
        }));

        // Set events in state
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
