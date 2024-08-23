import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Header from '../../Header';
import api from '../../Axiosconfig';


const activitiesOptions = ['Animations', 'Help with homework', 'Montessori', 'Manual activities'];
const moreOptions = ['Cooking', 'Housework', 'Gardening'];

const SitterRegistrationStep: React.FC = () => {
    const [activities, setActivities] = useState<string[]>([]);
    const [more, setMore] = useState<string[]>([]);
    const [sitterId, setSitterId] = useState<string>('');
    console.log(sitterId)

    const toast = useToast();
    const navigate = useNavigate();

    const toggleSelection = (value: string, setState: React.Dispatch<React.SetStateAction<string[]>>, state: string[]) => {
        setState(state.includes(value) ? state.filter(item => item !== value) : [...state, value]);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const data = {
            activities,
            more,
        };

        try {
            const sitterInfoString = localStorage.getItem('sitterInfo');
            if (sitterInfoString) {
                const sitterInfo = JSON.parse(sitterInfoString);
                setSitterId(sitterInfo._id);

                const response = await api.put(`/register-step3/${sitterInfo._id}`, data);
                console.log(response.data);
                if (response.status === 200 && response.data.sitter) {
                    localStorage.setItem('sitterInfo', JSON.stringify(response.data.sitter));
                    toast({
                        title: 'Success',
                        description: 'Sitter information updated successfully',
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right',
                    });
                    navigate('/sitter/sitterregister3');
                }
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while submitting data',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'top-right',
            });
            console.error(error);
        }
    };

    return (
        <>
            <Header />
            <div className="py-10" style={{ marginBottom: '10px' }}>
                <div className="flex h-96 bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                    <div className="hidden lg:block lg:w-1/2 bg-cover"
                        style={{ backgroundImage: `url('https://img.freepik.com/free-photo/pretty-sister-spending-time-with-her-baby-brother-sitting-floor-bedroom-beautiful-young-babysitter-playing-with-little-boy-indoors-holding-stuffed-toy-duck-infancy-childcare-motherhood_344912-7.jpg')`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
                    </div>
                    <div className="w-full p-8 lg:w-1/2">
                        <form onSubmit={handleSubmit}>
                            <h3 className="text-lg font-semibold font-mono text-center mb-4">Activities</h3>
                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                {activitiesOptions.map(activity => (
                                    <button
                                        type="button"
                                        key={activity}
                                        onClick={() => toggleSelection(activity, setActivities, activities)}
                                        className={`py-2 px-4 rounded-full font-mono ${activities.includes(activity) ? 'bg-custom-pink text-white' : 'bg-gray-200 text-gray-700'} transition`}
                                    >
                                        {activity}
                                    </button>
                                ))}
                            </div>

                            <h3 className="text-lg font-semibold font-mono text-center mb-4">More</h3>
                            <div className="flex flex-wrap justify-center gap-2">
                                {moreOptions.map(option => (
                                    <button
                                        type="button"
                                        key={option}
                                        onClick={() => toggleSelection(option, setMore, more)}
                                        className={`py-2 px-4 rounded-full font-mono ${more.includes(option) ? 'bg-custom-pink text-white' : 'bg-gray-200 text-gray-700'} transition`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4">
                                <button type="submit" className="bg-black text-white font-bold py-2 px-4 w-full rounded">Continue</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SitterRegistrationStep;
