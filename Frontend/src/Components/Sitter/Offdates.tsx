import { useState,useEffect } from 'react'

interface OffDateBody{
    OffDates : Date[]
}

const Offdates : React.FC<OffDateBody> = ({OffDates}) =>{

    const [ offDates,setOffdates] = useState<string[]>([]);

    useEffect(()=>{
        const dates = OffDates.map(date => new Date(date));
        const formatted = dates.map(date => date.toLocaleDateString());
        setOffdates(formatted)
    },[OffDates])
    return(
        <>
         <div className="card bg-base-100 w-96 shadow-xl">
                <div className="card-body">
                <h2 style={{ textDecoration: "underline", textDecorationColor: 'black', fontWeight: 'bold' }}>Available Dates:</h2>
                    {offDates.map((date, index) => (
                        <div key={index} className='font-semibold'>{date}</div>
                    ))}
                   
                </div>
            </div>
        </>
    )
}

export default Offdates