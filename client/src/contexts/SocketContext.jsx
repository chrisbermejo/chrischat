// SocketContext.js
import React, { createContext, useState } from 'react';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [socketID, setSocketID] = useState(null);

    return (
        <SocketContext.Provider value={{ socket, setSocket, socketID, setSocketID }}>
            {children}
        </SocketContext.Provider>
    );
};
