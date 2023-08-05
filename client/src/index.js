import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import { InfoProvider } from './contexts/InfoContext';
import Routes from './Routes';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter >
            <AuthProvider>
                <SocketProvider>
                    <InfoProvider>
                        <Routes />
                    </InfoProvider>
                </SocketProvider>
            </AuthProvider>
        </BrowserRouter >
    </React.StrictMode>
);

reportWebVitals();
