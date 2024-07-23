import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";

interface AvailableDates {
    availableDates: Date[];
}

interface SelectedsittingBody{
    selectedSitting:string
}


const Availabedates: React.FC<AvailableDates & SelectedsittingBody> = ({ availableDates,selectedSitting}) => {

    const [formattedDates, setFormattedDates] = useState<string[]>([]);
    const [occasionaldates,setAvailableDatesOccasional] = useState<Date[]>([])
    const [weekenddates,setAvailableDatesWeekend] = useState<Date[]>([])
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    console.log(selectedSitting,'se')

   
    useEffect(() => {
        const dates = availableDates.map(dateString => new Date(dateString));
        const formatted = dates.map(date => date.toLocaleDateString());
        setFormattedDates(formatted);
    }, [availableDates]);

   

    
    const handleAddDates = () => {
        navigate('/sitter/edit-slots',{ state: { availableDates } })
    };

    
    

    return (
        <>
            <div className="card bg-base-100 w-96 shadow-xl">
                <div className="card-body">
                <h2 style={{ textDecoration: "underline", textDecorationColor: 'black', fontWeight: 'bold' }}>Available Dates:</h2>
                    {formattedDates.map((date, index) => (
                        <div key={index} className='font-semibold'>{date}</div>
                    ))}
                <button className='rounded-lg bg-custom-pink w-76 h-11 font-mono font-semibold' onClick={handleAddDates}>Add dates</button> 
                </div>
            </div>

            
        </>
    )
}

export default Availabedates;