import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './pages/main';
import Login from './pages/login';
import Register from './pages/register';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/index" element={<Main />} />
            </Routes>
        </BrowserRouter>
    );
}
