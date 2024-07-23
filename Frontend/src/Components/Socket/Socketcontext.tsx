import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketProviderProps {
    children: ReactNode;
}

const SOCKET_SERVER_URL = 'http://localhost:5003';

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!socket) {
            const newSocket = io(SOCKET_SERVER_URL, {
                transports: ['websocket'],
            });
            console.log('Socket created:', newSocket);

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });


            newSocket.on('connect_error', (err) => {
                console.error('Connection error:', err);
            });

            setSocket(newSocket);

        }
    }, [socket]);

    console.log(socket, 'socket');

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
