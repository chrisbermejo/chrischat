import { InfoProvider } from '../../contexts/InfoContext'

import Nav from '../../components/Nav/Nav'
import Chat from '../../components/Chatroom/Chat'
import Header from '../../components/Chatroom/Header'
import InputBar from '../../components/Chatroom/InputBar'

import '../../App.css';

export default function App() {
    return (
        <InfoProvider>
            <div className='App'>
                <Nav />
                <div className="chatroom">
                    <Header />
                    <Chat />
                    <InputBar />
                </div>
            </div>
        </InfoProvider>
    );
};