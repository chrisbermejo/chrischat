import React from 'react';

import { Routes, Route } from 'react-router-dom';
import Main from './pages/main';
import Login from './pages/login';
import Register from './pages/register';
import RoomCreate from './pages/room'
import RequireAuth from './components/RequireAuth';

import useAuth from './hooks/useAuth';

export default function Views() {

    const { isAuthenticated } = useAuth();

    return isAuthenticated === null ? ' ' : (
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/room/create' element={<RoomCreate />} />
            <Route element={<RequireAuth />}>
                <Route index path="/channel" element={<Main />} />
            </Route>
            <Route path='*' element={<Login />} />
        </Routes>
    );
};