import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "../../Store";
import Sitterlayout from "./Sitterlayout";

interface EditregularsittingProps {
    slotId: string;
}

const Editregularsitting: React.FC<EditregularsittingProps> = ({ slotId }) => {
    const [slotData, setSlotData] = useState<any>(null);
    const [offDates, setOffDates] = useState<string[]>([]);

    const toast = useToast();
    const navigate = useNavigate();
    const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);

    const handleOffDatesChange = (index: number, value: string) => {
        const newOffDates = [...offDates];
        newOffDates[index] = value;
        setOffDates(newOffDates);
    };

    const handleAddOffDate = () => {
        setOffDates([...offDates, '']);
    };

    const handleRemoveOffDate = (index: number) => {
        const newOffDates = offDates.filter((_, i) => i !== index);
        setOffDates(newOffDates);
    };

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const response = await axios.get(`/api/sitter/get-editslots/${sitterInfo._id}/${slotId}`);
                console.log('Slot Response:', response.data);
                setSlotData(response.data.slot);
                setOffDates(response.data.slot.offDates || []);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                });
            }
        };
        fetchSlots();
    }, [sitterInfo, slotId, toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put(`/api/sitter/update-slot/${slotId}`, { offDates });
            toast({
                title: 'Success',
                description: 'Off dates updated successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            navigate('/sitter/slots');
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'An unknown error occurred',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
        }
    };

    return (
        <Sitterlayout>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Start Date</label>
                    <input type="text" value={slotData?.startDate ? new Date(slotData.startDate).toLocaleDateString() : ''} readOnly />
                </div>
                <div>
                    <label>End Date</label>
                    <input type="text" value={slotData?.endDate ? new Date(slotData.endDate).toLocaleDateString() : ''} readOnly />
                </div>
                <div>
                    <label>Start Time</label>
                    <input type="text" value={slotData?.startTime ? new Date(slotData.startTime).toLocaleTimeString() : ''} readOnly />
                </div>
                <div>
                    <label>End Time</label>
                    <input type="text" value={slotData?.endTime ? new Date(slotData.endTime).toLocaleTimeString() : ''} readOnly />
                </div>
                <div>
                    <label>Off Dates</label>
                    {offDates.map((date, index) => (
                        <div key={index}>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => handleOffDatesChange(index, e.target.value)}
                            />
                            <button type="button" onClick={() => handleRemoveOffDate(index)}>Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddOffDate}>Add Off Date</button>
                </div>
                <button type="submit">Save</button>
            </form>
        </Sitterlayout>
    );
};

export default Editregularsitting;
