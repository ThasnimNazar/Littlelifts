"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketIOInstance = exports.initializeSocketIO = void 0;
const socket_io_1 = require("socket.io");
let io;
const initializeSocketIO = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    console.log(io, 'ii');
    io.on('connection', (socket) => {
        console.log('hey');
        console.log('A user connected:', socket.id);
        socket.on('joinBabysitterRoom', (babysitterId) => {
            socket.join(`babysitter_${babysitterId}`);
            console.log(`Babysitter ${babysitterId} joined room with socket ID ${socket.id}`);
        });
        socket.on('joinParentRoom', (parentId) => {
            socket.join(`parent_${parentId}`);
            console.log(`parent ${parentId} joined room with socket ID ${socket.id}`);
        });
        socket.on('error', (err) => {
            console.error('Socket error:', err);
        });
    });
    return io;
};
exports.initializeSocketIO = initializeSocketIO;
const getSocketIOInstance = () => io;
exports.getSocketIOInstance = getSocketIOInstance;
