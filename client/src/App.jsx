import { SocketProvider } from './contexts/SocketContext';
import { AuthProvider } from './contexts/AuthContext';
import Views from './Views';


export default function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Views />
            </SocketProvider>
        </AuthProvider>
    );
}