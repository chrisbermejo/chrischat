import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Main from './pages/main';
import Login from './pages/login';
import Register from './pages/register';
import RequireAuth from './components/RequireAuth';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path='/login' element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route element={<RequireAuth />}>
                        <Route index path="/channel" element={<Main />} />
                    </Route>
                </Routes>
            </BrowserRouter >
        </AuthProvider>
    );
}
