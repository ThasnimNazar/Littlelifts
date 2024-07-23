import Sitterlayout from "../../Components/Sitter/Sitterlayout";
import Calendar from 'react-calendar';
import { useState, useEffect } from 'react';
import axios from "axios";
import { useLocation } from 'react-router-dom'
import { useSelector,useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSitterCredentials } from "../../Slices/Sitterslice";
import { RootState } from "../../Store";
import { useToast } from "@chakra-ui/react";
import 'react-calendar/dist/Calendar.css';
import '../../Css/Admin/Sitter/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

const Editslots: React.FC = () => {
  const [value, onChange] = useState<Value>(null);
  const [newAvailableDates, setNewAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const location = useLocation();
  const { availableDates } = location.state || { availableDates: [],};
  const toast = useToast();
  const navigate = useNavigate();

  const { sitterInfo } = useSelector((state:RootState)=>state.sitterAuth)
  const sitterId = sitterInfo?._id;
  const dispatch = useDispatch();

  

 

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      const formattedValue = value.toISOString().split('T')[0]; 
      const isDateAlreadySelected = availableDates.includes(formattedValue);

      if (isDateAlreadySelected) {
        toast({
          title: 'Date is already selected',
          status: 'info',
          isClosable: true,
        });
      } else {
        setNewAvailableDates(prevDates => [...prevDates, formattedValue]);
      }
    }
    onChange(value);
  };

  const handleTimeSlotSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;

    const startTimeDate = new Date(`1970-01-01T${startTime}:00`);
    const endTimeDate = new Date(`1970-01-01T${endTime}:00`);

    if (startTimeDate >= endTimeDate) {
      toast({
        title: 'Invalid time slot',
        description: 'Start time must be earlier than end time.',
        status: 'error',
        isClosable: true,
      });
      return;
    }

    for (const slot of timeSlots) {
      if (
        (startTimeDate >= slot.startTime && startTimeDate < slot.endTime) ||
        (endTimeDate > slot.startTime && endTimeDate <= slot.endTime)
      ) {
        toast({
          title: 'Invalid time slot',
          description: 'Time slot overlaps with an existing slot.',
          status: 'error',
          isClosable: true,
        });
        return;
      }
    }

    const newSlot: TimeSlot = { startTime: startTimeDate, endTime: endTimeDate };
    setTimeSlots(prevSlots => [...prevSlots, newSlot]);
    form.reset();
  };

  const handleSubmit = async () => {
    try {

      const formattedTimeSlots = timeSlots.map(slot => ({
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
      }));

      const response = await axios.put(`/api/sitter/edit-slot/${sitterId}`, {
        timeslots:formattedTimeSlots,
        availableDates:newAvailableDates
      });
      console.log(response,'re')

      dispatch(setSitterCredentials({...response.data.sitter}))
     

      toast({
        title: 'Slots updated successfully',
        status: 'success',
        isClosable: true,
      });
      navigate('/sitter/slot')
    } catch (error) {
      toast({
        title: 'Error updating slots',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <Sitterlayout>
      <div className="container mx-auto p-4">
        <div className="w-3/4 mx-auto">
          <h3 className="font-semibold font-mono text-center mb-4">
            Select your available dates
          </h3>
          <Calendar
            onChange={handleDateChange}
            value={value}
            tileDisabled={({ date }) => {
              const day = date.getDay();
              return day !== 0 && day !== 6;
            }}
          />
        </div>
        {newAvailableDates.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold font-serif mb-4">
              Selected Dates to Add Slots:
            </h3>
            {newAvailableDates.map((date, index) => (
              <div key={index} className="mb-4">
                <h4 className="text-lg font-medium font-serif">
                  {date}
                </h4>
              </div>
            ))}
            <form onSubmit={handleTimeSlotSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold font-serif mb-2">
                  Start Time
                </label>
                <input
                  name="startTime"
                  type="time"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold font-serif mb-2">
                  End Time
                </label>
                <input
                  name="endTime"
                  type="time"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-black text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Time Slot
              </button>
            </form>
            <div className="mt-4">
              <h4 className="text-lg font-medium font-serif mb-2">
                Time Slots:
              </h4>
              {timeSlots.map((slot, idx) => (
                <div key={idx} className="mb-2">
                  <button className="rounded-full px-4 py-2 bg-custom-pink text-black font-mono" style={{ width: '150px', height: '40px' }}>
                    {slot.startTime.toTimeString().slice(0, 5)} - {slot.endTime.toTimeString().slice(0, 5)}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              className="mt-4 bg-blue-500 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save All Slots
            </button>
          </div>
        )}
      </div>
    </Sitterlayout>
  );
};

export default Editslots;
