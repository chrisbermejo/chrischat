import { io } from 'socket.io-client';

let socket = null;

export const createSocket = () => {

    if (!socket) {
        socket = io('http://localhost:8000/channel');
    }
    return socket;
};
