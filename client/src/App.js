import React, { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {

    const [userID, setUserID] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const sendMessage = () => {
        if (message !== '') {
            socket.emit('send_message', { message: message });
            setMessage('');
        } else {
            return;
        }
    };

    socket.on("connect", () => {
        setUserID(socket.id);
    });

    useEffect(() => {
        socket.on('receive_message', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, []);

    useEffect(() => {
        console.log(messages);
        // console.log(userID);
    }, [messages]);

    return (
        <div className="App">
            <h1>Messages:</h1>
            <div className='chatroom-container'>
                <div className='chatroom'>
                    {messages.map((message) => (
                        <div className={message.user === userID ? 'chatroom-message-container client-con' : 'chatroom-message-container other-con'}>
                            <div className={message.user === userID ? 'chatroom-message client' : 'chatroom-message other'} key={message.id}>{message.message}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className='chatroom-inputs'>
                <input
                    type="text"
                    placeholder="Message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default App;
