import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';

const EditSlotModal = ({ slot, existingTimeslots, onClose }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [validationError, setValidationError] = useState('');

  const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);
  const sitterId = sitterInfo?._id;
  const toast = useToast();

  useEffect(() => {
    // Format start and end times to local time
    if (slot) {
      const start = new Date(slot.startTime);
      const end = new Date(slot.endTime);
      setStartTime(formatTime(start));
      setEndTime(formatTime(end));
    }
  }, [slot]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const validateTimeslot = () => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const newStartTime = new Date(2000, 0, 1, startHour, startMinute);

    const [endHour, endMinute] = endTime.split(":").map(Number);
    const newEndTime = new Date(2000, 0, 1, endHour, endMinute);

    const overlap = existingTimeslots.some(existingSlot => {
      const existingStartTime = new Date(existingSlot.startTime);
      const existingEndTime = new Date(existingSlot.endTime);
      return (
        (newStartTime >= existingStartTime && newStartTime < existingEndTime) ||
        (newEndTime > existingStartTime && newEndTime <= existingEndTime) ||
        (newStartTime <= existingStartTime && newEndTime >= existingEndTime)
      );
    });

    if (overlap) {
      setValidationError('Timeslot overlaps with existing slot. Please choose different times.');
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleUpdateSlot = async () => {
    if (!validateTimeslot()) {
      return;
    }

    try {
      const datePart = slot.startTime.split('T')[0]; 
      const formattedStartTime = new Date(`${datePart}T${startTime}`);
      const formattedEndTime = new Date(`${datePart}T${endTime}`);

      const response = await axios.put(`/api/sitter/edit-timeslots/${slot._id}/${sitterId}`, {
        startTime: formattedStartTime.toISOString(),
        endTime: formattedEndTime.toISOString()
      });

      if (response.status === 200) {
        toast({
          title: 'Success',
          description: 'Time slot updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
        onClose(); 
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update the slot',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-mono">Edit Time Slot</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 font-mono">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 block w-full px-3 py-2 font-mono border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 font-mono">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 block w-full px-3 py-2 font-mono border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {validationError && (
            <p className="text-red-500 text-sm">{validationError}</p>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={handleUpdateSlot}
            className="inline-flex justify-center px-4 py-2 font-mono text-sm font-medium text-white bg-custom-pink hover:bg-pink-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="inline-flex justify-center px-4 py-2 font-mono text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSlotModal;
