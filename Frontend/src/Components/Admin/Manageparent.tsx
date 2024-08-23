import React, { useEffect, useState } from 'react';
import { useToast, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '@chakra-ui/react';
import api from '../../Axiosconfig';


interface Parent{
  _id:string;
  name:string;
  email:string;
  phoneno:number;
  blocked:boolean
}

interface ParentBlock{
  _id:string;
  name:string;
  blocked:boolean;
}

const ManageParent: React.FC = () => {
  const [parents, setParent] = useState<Parent[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [parentToBlock, setParentToBlock] = useState<ParentBlock | null>(null);

  const toast = useToast();

  useEffect(() => {
    const fetchSitters = async () => {
      try {
        const response = await api.get('/get-parent');
        console.log(response.data, 'res');
        if (response.data && response.data[0]) {
            setParent(response.data[0]);
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
  }, [toast]);


 

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setParentToBlock(null);
  };

 
 

  const toggleBlockStatus = (parent: Parent) => {
    setParentToBlock(parent);
    setIsConfirmModalOpen(true);
  };

  const confirmBlockStatus = async () => {
    if (!parentToBlock) return;
    
    try {
      const updatedStatus = !parentToBlock.blocked;
      const endpoint = updatedStatus ? `/block-parent/${parentToBlock._id}` : `/unblock-parent/${parentToBlock._id}`;
      await api.put(endpoint);

      setParent((prevParent) =>
        prevParent.map((s) =>
          s._id === parentToBlock._id ? { ...s, blocked: updatedStatus } : s
        )
      );

      toast({
        title: updatedStatus ? 'Parent Blocked' : 'Parent Unblocked',
        description: `${parentToBlock.name} has been ${updatedStatus ? 'blocked' : 'unblocked'} successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      setIsConfirmModalOpen(false);
      setParentToBlock(null); 
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
    <>
      <div className="shadow-lg rounded-lg overflow-hidden mx-4 md:mx-10 m-20">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">Name</th>
              <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">Email</th>
              <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">Phone</th>
              <th className="w-1/4 py-4 px-6 text-left text-gray-600 font-bold uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {parents.map((parent, index) => (
              <tr key={index}>
                <td className="py-4 px-6 border-b border-gray-200">{parent.name}</td>
                <td className="py-4 px-6 border-b border-gray-200 truncate">{parent.email}</td>
                <td className="py-4 px-6 border-b border-gray-200">{parent.phoneno}</td>
                <td className="py-4 px-6 border-b border-gray-200">
                  <button
                    className={`py-1 px-2 rounded-full text-xs ${parent.blocked ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                    onClick={() => toggleBlockStatus(parent)}
                  >
                    {parent.blocked ? 'Blocked' : 'Active'}
                  </button>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isConfirmModalOpen} onClose={closeConfirmModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {parentToBlock && (
              <p>
                Are you sure you want to {parentToBlock.blocked ? 'unblock' : 'block'} {parentToBlock.name}?
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
    )
}
export default ManageParent