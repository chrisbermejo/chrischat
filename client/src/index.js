import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import { InfoProvider } from './contexts/InfoContext';
import Routes from './Routes';
import reportWebVitals from './reportWebVitals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter >
                <AuthProvider>
                    <SocketProvider>
                        <InfoProvider>
                            <Routes />
                        </InfoProvider>
                    </SocketProvider>
                </AuthProvider>
            </BrowserRouter >
        </QueryClientProvider>
    </React.StrictMode>
);

reportWebVitals();
