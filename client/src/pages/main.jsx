import React, { useState, useEffect, useRef } from 'react';
import '../App.css';
import useSocket from '../hooks/useSocket';

function Chatroom() {

    const { socket, socketID } = useSocket(); // Access the socket instance from the socket context

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const chatMessage = useRef(null);

    const sendMessage = () => {
        if (message !== '') {
            socket.emit('send_message', { message: message });
            setMessage('');
        } else {
            return;
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on('receive_message', (data) => {
                setMessages((prevMessages) => [...prevMessages, data]);
            });

            return () => {
                socket.off('receive_message');
            };
        }
    }, [socket]);

    useEffect(() => {
        if (chatMessage.current) {
            chatMessage.current.scrollIntoView();
        }
    }, [messages]);

    return (
        <div className="chatroom">
            <h1 className='chatroom-title'>Messages</h1>
            <div className='chatroom-chat-container'>
                <div className='chatroom-chat'>
                    {messages.map((message, index) => (
                        <div key={index} ref={index === messages.length - 1 ? chatMessage : null} className={message.user === socketID ? 'chatroom-message-container client-con' : 'chatroom-message-container other-con'}>
                            <div className={message.user === socketID ? 'chatroom-message client' : 'chatroom-message other'}>
                                {message.user}: {message.message}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className='chatroom-inputs-container'>
                <input
                    className='chatroom-inputs'
                    type="text"
                    placeholder="Message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
            </div>
        </div>
    );
}

export default Chatroom;
