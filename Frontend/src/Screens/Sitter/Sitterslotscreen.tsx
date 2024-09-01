import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../Store";
import Weekendslot from "../../Components/Sitter/Weekendslot";
import Specialcareslot from "../../Components/Sitter/Specialcareslot";
import Occasionalslot from "../../Components/Sitter/Occasionalslot";
import { sitterApi } from '../../Axiosconfig';


interface TimeSlot {
    _id: string;
    startTime: string;
    endTime: string;
    error: string | null;
  }

const Sitterslotscreen: React.FC = () => {
    const { sitterInfo } = useSelector((state: RootState) => state.sitterAuth);
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSitting, setSelectedSitting] = useState<string>('');
    const [availableDates, setAvailableDates] = useState<{ date: string | Date; timeslots: TimeSlot[] }[]>([]);
    const [ offDates,setOffdates ] = useState<Date[]>([])


    useEffect(() => {
        const fetchSlots = async () => {
            if (!sitterInfo) return;

            setIsLoading(true);
            try {
                const response = await sitterApi.get(`/get-slots/${sitterInfo._id}`);
                console.log(response.data.slots[0].availableDates)
                console.log(response.data.slots[0].offDates)
                setAvailableDates(response.data.slots[0].availableDates)
                setOffdates(response.data.slots[0].offDates)
                const slotsData = response.data.slots[0];
                console.log(slotsData)

                if (slotsData) {
                    const categoryResponse = await sitterApi.get(`/get-sittingcategory/${slotsData.sittingCategory}`);
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
            <>
        {isLoading ? (
            <div>Loading...</div>
        ) : (
            <div className="grid grid-cols-1 gap-5 m-10">
                {renderSlotComponent()} 
            </div>
        )}
        </>
    );
};

export default Sitterslotscreen;
