import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "../../Store";
import Sitterlayout from "../../Components/Sitter/Sitterlayout";
import Weekendslot from "../../Components/Sitter/Weekendslot";
import Specialcareslot from "../../Components/Sitter/Specialcareslot";
import Occasionalslot from "../../Components/Sitter/Occasionalslot";

interface TimeSlot {
    startTime: Date | null;
    endTime: Date | null;
    error: string | null;
}

const Sitterslotscreen: React.FC = () => {
    const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSitting, setSelectedSitting] = useState<string>('');
    const [availableDates, setAvailableDates] = useState<{ date: Date; timeslots: TimeSlot[] }[]>([]);
    const [ offDates,setOffdates ] = useState<Date[]>([])

    const navigate = useNavigate();

    useEffect(() => {
        const fetchSlots = async () => {
            if (!sitterInfo) return;

            setIsLoading(true);
            try {
                const response = await axios.get(`/api/sitter/get-slots/${sitterInfo._id}`);
                console.log(response.data.slots[0].availableDates)
                console.log(response.data.slots[0].offDates)
                setAvailableDates(response.data.slots[0].availableDates)
                setOffdates(response.data.slots[0].offDates)
                const slotsData = response.data.slots[0];
                console.log(slotsData)

                if (slotsData) {
                    const categoryResponse = await axios.get(`/api/sitter/get-sittingcategory/${slotsData.sittingCategory}`);
                    setSelectedSitting(categoryResponse.data.category.name);
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'An unknown error occurred',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSlots();
    }, [sitterInfo, toast]);

    const renderSlotComponent = () => {
        switch (selectedSitting) {
            case 'Weekend Sitting':
                return <Weekendslot availableDates = {availableDates} offDates={offDates} />;
            case 'Specialcare Sitting':
                    return <Specialcareslot availableDates = {availableDates} offDates={offDates} />;
            case 'Occasional Sitting':
                    return <Occasionalslot availableDates = {availableDates} offDates={offDates}/>;    
            default:
                return <div>Select a valid sitting type.</div>;
        }
    };

    return (
        <Sitterlayout>
        {isLoading ? (
            <div>Loading...</div>
        ) : (
            <div className="grid grid-cols-1 gap-5 m-10">
                {renderSlotComponent()} 
            </div>
        )}
    </Sitterlayout>
    );
};

export default Sitterslotscreen;
