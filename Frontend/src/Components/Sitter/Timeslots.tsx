import { useState, useEffect } from "react";

interface TimeSlot {
    startTime: string;
    endTime: string;
}

interface TimeSlotsBody {
    TimeSlots: TimeSlot[];
}

const Timeslots: React.FC<TimeSlotsBody> = ({ TimeSlots }) => {
    const [timeslots, setTimeslots] = useState<TimeSlot[]>([]);

    useEffect(() => {
        setTimeslots(TimeSlots);
    }, [TimeSlots]);

    return (
        <>
            <div className="card bg-base-100 w-96 shadow-xl">
                <div className="card-body">
                    <h2 style={{ textDecoration: "underline", textDecorationColor: 'black', fontWeight: 'bold' }}>Time Slots:</h2>
                    {timeslots.map((slot, index) => (
                        <div key={index} className="font-semibold">
                            <button className="rounded-full px-4 py-2 bg-custom-pink text-black" style={{ width: '150px', height: '50px' }}>
                                {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Timeslots;
