import { io } from 'socket.io-client';

export const createSocket = () => {
    const socket = io('http://localhost:8000/channel');
    return socket;
};
