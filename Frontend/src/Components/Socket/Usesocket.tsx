import { useContext } from 'react';
import SocketContext from './Socketcontext';

const useSocket = () => {
    return useContext(SocketContext);
};

export default useSocket;
