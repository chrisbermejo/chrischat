import React, { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const sendMessage = () => {
        socket.emit('send_message', { message: message });
        setMessage('');
    };

    useEffect(() => {
        socket.on('receive_message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, []);

    return (
        <div className="App">
            <input
                type="text"
                placeholder="Message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
            <h1>Messages:</h1>
            <ul>
                {messages.map((message) => (
                    <li key={message.id}>{message.message}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;
