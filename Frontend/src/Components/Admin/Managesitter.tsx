import React, { useEffect, useState } from 'react';
import { useToast, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,Flex, Box } from '@chakra-ui/react';
import { adminApi } from '../../Axiosconfig';

interface Sitter {
  _id: string;
  name: string;
  email: string;
  phoneno: number;
  maxchildren: number;
  workwithpet: string;
  yearofexperience: number;
  gender: string;
  blocked: boolean;
  verified: boolean;
  verificationDocuments: string[];
  servicepay: number;
}

interface SitterBlock {
  _id: string;
  name: string;
  blocked: boolean;
}


const Managesitter: React.FC = () => {
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedSitter, setSelectedSitter] = useState<Sitter | null>(null);
  const [sitterToBlock, setSitterToBlock] = useState<SitterBlock | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


  const toast = useToast();

  useEffect(() => {
    const fetchSitters = async () => {
      try {
        const response = await adminApi.get('/get-sitters');
        console.log(response.data, 'res');
        if (response.data && response.data[0]) {
          setSitters(response.data[0]);
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
    fetchSitters();
  }, []);

  const handleVerify = (sitter: Sitter) => {
    setSelectedSitter(sitter);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSitterToBlock(null);
  };

  const renderDocument = (url: string) => {
    if (typeof url !== 'string') return null;

    const extension = url.split('.').pop();
    if (extension === 'png' || extension === 'jpg' || extension === 'jpeg') {
      return <img src={url} alt="Document" style={{ width: '100%', height: 'auto' }} />;
    } else if (extension === 'pdf') {
      return <iframe src={url} width="100%" height="500px" title="PDF Document"></iframe>;
    } else {
      return <a href={url} target="_blank" rel="noopener noreferrer">Download Document</a>;
    }
  };

  const verifySitter = async () => {
    if (!selectedSitter) return;

    try {
      await adminApi.put(`/verify/${selectedSitter._id}`);

      setSitters((prevSitters) =>
        prevSitters.map((sitter) =>
          sitter._id === selectedSitter._id ? { ...sitter, verified: true } : sitter
        )
      );

      toast({
        title: 'Sitter Verified',
        description: `${selectedSitter.name} has been verified successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      closeModal();
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

  const toggleBlockStatus = (sitter: Sitter) => {
    setSitterToBlock(sitter);
    setIsConfirmModalOpen(true);
  };

  const confirmBlockStatus = async () => {
    if (!sitterToBlock) return;

    try {
      const updatedStatus = !sitterToBlock.blocked;
      const endpoint = updatedStatus ? `/block-sitter/${sitterToBlock._id}` : `/unblock-sitter/${sitterToBlock._id}`;
      await adminApi.put(endpoint);

      setSitters((prevSitters) =>
        prevSitters.map((s) =>
          s._id === sitterToBlock._id ? { ...s, blocked: updatedStatus } : s
        )
      );

      toast({
        title: updatedStatus ? 'Sitter Blocked' : 'Sitter Unblocked',
        description: `${sitterToBlock.name} has been ${updatedStatus ? 'blocked' : 'unblocked'} successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      closeConfirmModal();
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

  const totalPages = Math.ceil(sitters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSitters = sitters.slice(startIndex, endIndex);


  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  return (
    <>
      <div className="shadow-lg rounded-lg overflow-hidden mx-4 md:mx-10 m-20">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">Name</th>
              <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">Email</th>
              <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">Phone</th>
              <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">Status</th>
              <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">Verify</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {paginatedSitters.map((sitter, index) => (
              <tr key={index}>
                <td className="py-4 px-6 border-b border-gray-200">{sitter.name}</td>
                <td className="py-4 px-6 border-b border-gray-200 truncate">{sitter.email}</td>
                <td className="py-4 px-6 border-b border-gray-200">{sitter.phoneno}</td>
                <td className="py-4 px-6 border-b border-gray-200">
                  <button
                    className={`py-1 px-2 rounded-full text-xs ${sitter.blocked ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                    onClick={() => toggleBlockStatus(sitter)}
                  >
                    {sitter.blocked ? 'Blocked' : 'Active'}
                  </button>
                </td>
                <td className="text-white border-gray-200">
                  <Button
                    size="sm"
                    colorScheme={sitter.verified ? 'green' : 'yellow'}
                    onClick={() => handleVerify(sitter)}
                  >
                    {sitter.verified ? 'Verified' : 'Unverified'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Flex justifyContent="space-between" mt={4} alignItems="center">
      <Button onClick={handlePreviousPage} disabled={currentPage === 1}>
        Previous
      </Button>
      <Box>
        Page {currentPage} of {Math.ceil(sitters.length / itemsPerPage)}
      </Box>
      <Button onClick={handleNextPage} disabled={currentPage === Math.ceil(sitters.length / itemsPerPage)}>
        Next
      </Button>
    </Flex>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sitter Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <p>Name: {selectedSitter?.name}</p>
            <p>Email: {selectedSitter?.email}</p>
            <p>Phone: {selectedSitter?.phoneno}</p>
            <p>Gender: {selectedSitter?.gender}</p>
            <p>Max children will watch: {selectedSitter?.maxchildren}</p>
            <p>Service pay: {selectedSitter?.servicepay}</p>
            <p>Willing to work with pet: {selectedSitter?.workwithpet}</p>
            <p>Years of experience: {selectedSitter?.yearofexperience}</p>
            <p>Submitted documents:</p>
            {selectedSitter?.verificationDocuments && Array.isArray(selectedSitter.verificationDocuments) && selectedSitter.verificationDocuments.length > 0 ? (
              selectedSitter.verificationDocuments.map((doc: string, index: number) => (
                <div key={index}>
                  {renderDocument(doc)}
                </div>
              ))
            ) : (
              <p>None</p>
            )}
            <p>Status: {selectedSitter?.blocked ? 'Blocked' : 'Active'}</p>
            <p>Verification Status: {selectedSitter?.verified ? 'Verified' : 'Unverified'}</p>
          </ModalBody>
          <ModalFooter>
            {!selectedSitter?.verified && (
              <Button colorScheme="blue" mr={3} onClick={verifySitter}>
                Verify
              </Button>
            )}
            <Button variant="ghost" onClick={closeModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isConfirmModalOpen} onClose={closeConfirmModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {sitterToBlock && (
              <p>
                Are you sure you want to {sitterToBlock.blocked ? 'unblock' : 'block'} {sitterToBlock.name}?
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={confirmBlockStatus}>
              Yes
            </Button>
            <Button variant="ghost" onClick={closeConfirmModal}>
              No
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Managesitter;
