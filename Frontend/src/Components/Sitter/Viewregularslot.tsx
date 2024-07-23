import Sitterlayout from "./Sitterlayout"


interface Viewregularslot {
    slotData: any[]
}

const Regularslot: React.FC<Viewregularslot> = ({ slotData }) => {
    console.log(slotData, 'haa')
    return (
        <>
                <div className="grid grid-cols-1 gap-5 m-10">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col border rounded-lg p-4">
                            <h3 className="text-md font-medium font-mono mb-2">Start Date: {new Date(slotData.startDate).toLocaleDateString()}</h3>
                            <h3 className="text-md font-medium font-mono mb-2">End Date: {new Date(slotData.endDate).toLocaleDateString()}</h3>
                            <div className="flex flex-wrap gap-2">
                                    <button  className="bg-custom-pink text-white font-mono px-4 py-2 rounded">
                                        {new Date(slotData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slotData.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1">
                        <h2 className="text-lg font-semibold mb-4 font-mono">Off Dates</h2>
                        <ul>
                            {slotData.offDates && slotData.offDates.length > 0 && slotData.offDates.map((offDate: string, index: number) => (
                                <li key={index} className="mb-2 font-mono">
                                    {new Date(offDate).toLocaleDateString()}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div style={{ alignItems: 'center', justifyContent: 'center', marginLeft: '30px' }}>
                    <button className='rounded-xs w-52 h-12 bg-black text-white'>Add slot</button>
                </div>
        </>
    )
}

export default Regularslot