import React, { createContext, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

import { createSocket } from '../socket';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {

    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [socketID, setSocketID] = useState(null);

    useEffect(() => {

        if (user && !socket) {
            const newSocket = createSocket();
            newSocket.on('connect', () => {
                setSocket(newSocket);
                setSocketID(newSocket.id);
            });
            return () => {
                newSocket.off('connect');
            };
        }

    }, [user, socket]);

    return (
        <SocketContext.Provider value={{ socket, setSocket, socketID, setSocketID }}>
            {children}
        </SocketContext.Provider>
    );
};
