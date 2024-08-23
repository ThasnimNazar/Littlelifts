import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { RootState } from '../../Store';
import { useNavigate } from 'react-router-dom';
import api from '../../Axiosconfig'


const Parentprivateroutes = () => {
    const [isBlocked, setIsBlocked] = useState<boolean | null>(null);
    const { parentInfo } = useSelector((state: RootState) => state.parentAuth);
    const parentId = parentInfo?._id;
    const toast = useToast();
    const navigate = useNavigate();
    console.log(isBlocked)

    useEffect(() => {
        const blockCheck = async () => {
            if (!parentId) {
                setIsBlocked(false); 
                return;
            }

            try {
                const response = await api.get('/check-block', {
                    params: { parentId }
                });
                console.log('Block check response:', response.data);

                if (response.data.parent.blocked === true) {
                    toast({
                        title: 'Info',
                        description: 'Your account is blocked',
                        status: 'info',
                        duration: 3000,
                        isClosable: true,
                        position: 'top-right',
                    });

                    navigate('/parent/parentlogin', { replace: true });
                } 
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'An unknown error occurred',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                    position: 'top-right',
                });
                setIsBlocked(false);
            }
        };

        blockCheck();
    }, [parentId, toast, navigate]);

   
    return parentInfo ? <Outlet /> : <Navigate to='/parent/parentlogin' replace />;
};

export default Parentprivateroutes;
