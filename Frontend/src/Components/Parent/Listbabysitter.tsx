import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast,useDisclosure, Button, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, DrawerFooter } from '@chakra-ui/react';
import Search from './Search';
interface Category {
    category: string;
}

const Listbabysitter: React.FC<Category> = ({ category }) => {
    const categoryId = category;
    const [babysitters, setBabysitters] = useState<any[]>([]);
    const [selectedSitter, setSelectedSitter] = useState<any | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure(); // Chakra UI useDisclosure hook for managing drawer state
    const toast = useToast();

    const handleViewProfile = (sitter: any) => {
        setSelectedSitter(sitter);
        onOpen(); // Open the drawer when viewing profile
    };

    useEffect(() => {
        const fetchBabysitters = async () => {
            try {
                const response = await axios.get(`/api/sitter/get-sitter/${categoryId}`);
                setBabysitters(response.data.sitter);
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    toast({
                        title: 'Error',
                        description: error.response.data.message || 'An unknown error occurred',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right',
                    });
                } else {
                    toast({
                        title: 'Error',
                        description: 'An unknown error occurred',
                        status: 'error',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right',
                    });
                }
            }
        };

        fetchBabysitters();
    }, [categoryId, toast]);

    return (
        <>
        <Search/>
        <div className="mt-10" style={{ marginRight: '20px' }}>
            {babysitters.map((babysitter) => (
                <div
                    key={babysitter._id}
                    className="flex bg-base-100 w-full shadow-xl rounded-md p-4 mb-4 border-l-4"
                    style={{ borderLeftColor: '#ffa2b6' }}
                >
                    <div className="rounded-full overflow-hidden w-32 h-32 mr-4">
                        <img
                            src={babysitter.profileImage}
                            alt={babysitter.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-1 justify-between items-center">
                        <div>
                            <h2 className="card-title text-xl font-bold font-sans">{babysitter.name}</h2>
                            <p className="text-gray-700 font-serif font-medium">{babysitter.email}</p>
                        </div>
                        <div className="card-actions">
                            <button
                                className="button rounded-xs w-28 h-11 font-semibold font-mono border-2 border border-custom-pink"
                                style={{ backgroundColor: 'white' }}
                                onClick={() => handleViewProfile(babysitter)}
                            >
                                View Profile
                            </button>
                            {/* Example function placeholder */}
                            <button
                                className="button rounded-xs w-28 h-11 font-semibold font-mono"
                                style={{ backgroundColor: '#ffa2b6' }}
                                onClick={() => handleCategorySelect(babysitter._id)}
                            >
                                Reserve
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            {/* Render Chakra UI Drawer component when isOpen is true */}
            <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={onClose}
                finalFocusRef={null}
                size = 'sm'
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Profile</DrawerHeader>
                    <DrawerBody>
                        {/* Content of the Drawer */}
                        {selectedSitter && (
                            <div>
                                <h2 className='font-mono'>{selectedSitter.name}</h2>
                                <p className='font-mono'>Email: {selectedSitter.email}</p>
                                {/* Add more profile details as needed */}
                            </div>
                        )}
                    </DrawerBody>
                    <DrawerFooter>
                       
                        {/* Add any footer actions here */}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
        </>
    );
};

export default Listbabysitter;
