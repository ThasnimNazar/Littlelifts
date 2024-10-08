import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { useToast } from '@chakra-ui/react';
import { format } from 'date-fns';
import { sitterApi } from '../../Axiosconfig'

interface Slot {
  startTime: string;
  endTime: string;
}

interface SlotProps {
  startDate: Date | string;
  onClose: () => void;
}

const AddSlotModal:React.FC<SlotProps> = ({ startDate, onClose, }) => {
  const [slots, setSlots] = useState<Slot[]>([{ startTime: '', endTime: '' }]);
  const toast = useToast()

  const { sitterInfo } = useSelector((state:RootState)=>state.sitterAuth)
  const sitterId = sitterInfo?._id;



  const handleSlotChange = (index:number, field:keyof Slot, value: string) => {

    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  const addSlot = () => {
    setSlots([...slots, { startTime: '', endTime: '' }]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const currentDate = new Date();
    const isToday = format(startDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
  
    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const slotStartTime = new Date(`${format(startDate, 'yyyy-MM-dd')}T${slot.startTime}`);
        const slotEndTime = new Date(`${format(startDate, 'yyyy-MM-dd')}T${slot.endTime}`);
  
        if (isToday && slotStartTime < currentDate) {
            toast({
                title: 'Info',
                description: 'Start time cannot be in the past.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            return;
        }
  
        if (slotStartTime >= slotEndTime) {
            toast({
                title: 'Info',
                description: 'Start time should be less than end time.',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            return;
        }
  
        for (let j = 0; j < slots.length; j++) {
            if (i !== j) {
                const existingSlot = slots[j];
                const existingSlotStartTime = new Date(`${format(startDate, 'yyyy-MM-dd')}T${existingSlot.startTime}`);
                const existingSlotEndTime = new Date(`${format(startDate, 'yyyy-MM-dd')}T${existingSlot.endTime}`);
                
                if (
                    (slotStartTime < existingSlotEndTime && slotEndTime > existingSlotStartTime)
                ) {
                    toast({
                        title: 'Error',
                        description: 'Overlapping time slots are not allowed.',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right',
                    });
                    return;
                }
            }
        }
    }
  
    const newSlotData = {
      availableDates: [
        {
          date: format(startDate, 'yyyy-MM-dd'),
          timeslots: slots.map(slot => ({
            startTime: new Date(`${format(startDate, 'yyyy-MM-dd')}T${slot.startTime}`),
            endTime: new Date(`${format(startDate, 'yyyy-MM-dd')}T${slot.endTime}`)
          }))
        }
      ]
    };
  
    try {
      const response = await sitterApi.put(`/edit-slot/${sitterId}`, newSlotData);
      console.log('Slot added:', response.data);
      if (response.status === 200) {
        toast({
          title: 'Success',
          description: 'Slots added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
        onClose();
      }
    } catch (error) {
      console.error('Error adding slot:', error);
      toast({
        title: 'Error',
        description: 'Failed to add slots',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
};

  

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center">
      <div className="fixed inset-0 transition-opacity bg-gray-500 opacity-75" aria-hidden="true"></div>

      <div className="relative w-full max-w-lg p-4 sm:my-8">
        <div className="animate-slide-down bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-3/4">
                  <h3 className="text-lg font-mono leading-6 font-semibold text-gray-900">Add Time Slot</h3>
                  <div className="mt-2">
                    <p className="text-sm font-mono font-bold text-gray-500">
                      Selected Date: {format(startDate, 'yyyy-MM-dd')}
                    </p>
                    {slots.map((slot, index) => (
                      <div key={index} className="mt-4">
                        <label htmlFor={`startTime-${index}`} className="block text-sm font-mono font-medium text-gray-700">
                          Start Time
                        </label>
                        <input
                          type="time"
                          id={`startTime-${index}`}
                          name="startTime"
                          value={slot.startTime}
                          onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                          className="mt-1 block w-full border-gray-300 h-11 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                        <label htmlFor={`endTime-${index}`} className="block text-sm font-mono font-medium text-gray-700 mt-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          id={`endTime-${index}`}
                          name="endTime"
                          value={slot.endTime}
                          onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                          className="mt-1 block w-full h-11 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSlot}
                      className="mt-4 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
                    >
                      Add Another Slot
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-custom-pink text-base font-medium text-white hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSlotModal;
