import React from 'react';

import { Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import RequireAuth from './components/RequireAuth';

import useAuth from './hooks/useAuth';

export default function Views() {

    const { isAuthenticated } = useAuth();

    return isAuthenticated === null ? ' ' : (
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route element={<RequireAuth />}>
                <Route index path="/channel" element={<App />} />
            </Route>
            <Route path='*' element={<Login />} />
        </Routes>
    );
};