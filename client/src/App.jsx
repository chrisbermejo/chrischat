import { Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';


import Main from './pages/main';
import Login from './pages/login';
import Register from './pages/register';
import RoomCreate from './pages/room'
import RequireAuth from './components/RequireAuth';

export default function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Routes>
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/room/create' element={<RoomCreate />} />
                    <Route element={<RequireAuth />}>
                        <Route index path="/channel" element={<Main />} />
                    </Route>
                </Routes>
            </SocketProvider>
        </AuthProvider>
    );
}
