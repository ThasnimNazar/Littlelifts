import { Server } from 'socket.io';
import { createServer } from 'node:http';
import http from 'http';

let io: Server;

const initializeSocketIO = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    console.log(io,'ii')

    io.on('connection', (socket) => {
        console.log('hey')
        console.log('A user connected:', socket.id);

        socket.on('joinBabysitterRoom', (babysitterId) => {
            socket.join(`babysitter_${babysitterId}`);
            console.log(`Babysitter ${babysitterId} joined room with socket ID ${socket.id}`);
        });
        
        socket.on('joinParentRoom',(parentId)=>{
            socket.join(`parent_${parentId}`)
            console.log(`parent ${parentId} joined room with socket ID ${socket.id}`);

        })
        
        socket.on('error', (err) => {
            console.error('Socket error:', err);
        });
    });

    return io;
};

const getSocketIOInstance = () => io;

export { initializeSocketIO, getSocketIOInstance };
