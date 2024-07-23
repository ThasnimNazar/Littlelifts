import Header from "../../Header";
import { useEffect, useState } from "react";
import { useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setSitterCredentials } from "../../Slices/Sitterslice";

interface Sittingcategory {
    _id: string;
    name: string;
    description: string;
}

interface ResponseData {
    category: Sittingcategory[];
}

const Sitterregisterstep3screen: React.FC = () => {
    const toast = useToast();
    const navigate = useNavigate();

    const [sittingcategory, setSittingcategory] = useState<Sittingcategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Sittingcategory | null>(null);
    const [selectedId,setSelectedid] = useState<string>('')
    const [selectedname,setSelectedname] = useState<string>('')
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [sitterId,setSitterId] = useState<string>('')

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axios.get('/api/sitter/get-sittingcategory');
                console.log(response);
                if (response.data && Array.isArray(response.data.category)) {
                    setSittingcategory(response.data.category);
                } else {
                    toast({
                        title: 'Error',
                        description: 'Invalid response format',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right',
                    });
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
            }
        };
        fetchCategory();
    }, [toast]);

    const handleCategoryClick = (category: Sittingcategory) => {
        setSelectedCategory(category);
        setSelectedid(category._id)
        setSelectedname(category.name)
        setIsModalOpen(true);
    };
    const handleSelectCategory = async () => {
        if (selectedCategory) {
            const sitterInfoString = localStorage.getItem('sitterInfo');
            if (sitterInfoString) {
                const sitterInfo = JSON.parse(sitterInfoString);
                setSitterId(sitterInfo._id);

                try {
                    const response = await axios.put(`/api/sitter/save-sittingoption/${sitterInfo._id}`, {
                        selectedOption: selectedCategory.name,
                        selectedOptionId: selectedCategory._id
                    });

                    toast({
                        title: 'Success',
                        description: response.data.message,
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right',
                    });

                    navigate(`/sitter/sitterregister4/${selectedCategory._id}`, { state: { selectedname: selectedCategory.name } });
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
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
    };

    return (
        <>
            <Header />
            <div className="py-10" style={{ marginBottom: '10px' }}>
                <div className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
                    <div className="hidden lg:block lg:w-1/2 bg-cover"
                        style={{ backgroundImage: `url('https://img.freepik.com/free-photo/pretty-sister-spending-time-with-her-baby-brother-sitting-floor-bedroom-beautiful-young-babysitter-playing-with-little-boy-indoors-holding-stuffed-toy-duck-infancy-childcare-motherhood_344912-7.jpg')`, backgroundPosition: 'center', backgroundSize: 'cover' }}>
                    </div>
                    <div className="w-full p-8 lg:w-1/2">
                        <h3 className="text-xl font-semibold text-gray-700 text-center" style={{ fontFamily: "Agrandir, Helvetica, Arial, Lucida, sans-serif" }}>
                            Welcome! Register for your service, complete your third step of registration
                        </h3>
                        <div className="mt-4 flex items-center justify-between">
                            <span className="border-b w-1/5 lg:w-1/4"></span>
                            <a href="#" className="text-xs text-center text-black uppercase">or login with email</a>
                            <span className="border-b w-1/5 lg:w-1/4"></span>
                        </div>
                        <br />
                        <div>
                            <p className='text-sm font-bold' style={{ fontFamily: "Agrandir, Helvetica, Arial, Lucida, sans-serif" }}>Select your sitting Option</p>
                        </div>
                        <fieldset className="space-y-4">
                            <legend className="sr-only">Delivery</legend>
                            {sittingcategory.map((category) => (
                                <div key={category._id}>
                                    <label
                                        htmlFor={`option-${category._id}`}
                                        className="flex cursor-pointer justify-between gap-2 rounded-lg border border-black bg-white p-2 text-sm font-medium shadow-sm hover:border-black"
                                        onClick={() => handleCategoryClick(category)}
                                    >
                                        <div>
                                            <p className="text-gray-700">{category.name}</p>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </fieldset>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selectedCategory?.name}</ModalHeader>
                    <ModalBody>
                        <p className='text-sm font-medium'>{selectedCategory?.description}</p>
                        <div role="alert" className="alert shadow-lg bg-white mt-5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <div>
                                <h3 className="text-sm font-semibold">please review before proceeding!coz this will be your default sitting option</h3>
                            </div>
                        </div>

                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={handleSelectCategory}>
                            Select
                        </Button>
                        <Button colorScheme="red" onClick={handleCloseModal} ml={3}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default Sitterregisterstep3screen;
