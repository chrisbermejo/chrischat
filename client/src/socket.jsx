import { io } from 'socket.io-client';

let socket = null;

export const createSocket = () => {

    console.log(socket);

    if (!socket) {
        socket = io('http://localhost:8000/channel');
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
