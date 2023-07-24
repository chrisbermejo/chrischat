import { io } from 'socket.io-client';

let socket = null;

export const createSocket = (jwtToken) => {
    if (!socket || (socket && socket.jwtToken !== jwtToken)) {
        socket = io('http://localhost:8000/channel', {
            auth: {
                token: jwtToken,
            },
        });
        socket.jwtToken = jwtToken;
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
