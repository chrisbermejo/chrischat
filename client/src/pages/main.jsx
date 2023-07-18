import React, { useState, useEffect, useRef } from 'react';

import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';

import '../App.css';

const fetchData = async () => {
    const response = await fetch('http://localhost:4000/room/1', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        console.log('failed');
    }
};

function Chatroom() {

    const { socket, socketID } = useSocket();

    const { user, userProfilePicture } = useAuth();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [fetchedMessages, setfetchedMessages] = useState([]);

    const chatMessage = useRef(null);

    const sendMessage = () => {
        if (message !== '') {
            socket.emit('send_message', {
                id: socketID,
                user: user,
                message: message,
                date: new Date().toLocaleString('en-US', {
                    timeZone: 'America/New_York',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                }),
                time: new Date().toLocaleString('en-US', {
                    timeZone: 'America/New_York',
                    hour12: true,
                    hour: 'numeric',
                    minute: '2-digit',
                })
            });
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

    useEffect(() => {
        if (fetchedMessages.length >= 0) {
            fetchData().then(data => {
                setfetchedMessages(data);
            });
        }
    }, []);

    useEffect(() => {
        if (chatMessage.current) {
            chatMessage.current.scrollIntoView();
        }
    }, [fetchedMessages]);


    return (
        <div className="chatroom">
            <h1 className='chatroom-title'>Messages</h1>
            <div className='chatroom-chat-container'>
                <div className='chatroom-chat'>
                    {fetchedMessages.map((message, index) => (
                        <div datatype='fetched' key={index} className={message.user === user ? 'chatroom-message-container client-con' : 'chatroom-message-container other-con'}>
                            <div className={message.user === user ? 'chatroom-message client' : 'chatroom-message other'}>
                                <div className='chatroom-message-username'><span>-</span>{message.user === user ? user : message.user}</div>
                                <div className='chatroom-message-text'>{message.message}</div>
                                <div className='chatroom-message-time'>{message.time}</div>
                            </div>
                            <img src={message.user === user ? userProfilePicture : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'} className='chatroom-message-avatar' alt='avatar' />
                        </div>
                    ))}
                    <div className='hidden-message' ref={chatMessage}></div>
                    {messages.map((message, index) => (
                        <div key={index} ref={index === messages.length - 1 ? chatMessage : null} className={message.user === user ? 'chatroom-message-container client-con' : 'chatroom-message-container other-con'}>
                            <div className={message.user === user ? 'chatroom-message client' : 'chatroom-message other'}>
                                <div className='chatroom-message-username'><span>-</span>{message.user === user ? user : message.user}</div>
                                <div className='chatroom-message-text'>{message.message}</div>
                                <div className='chatroom-message-time'>{message.time}</div>
                            </div>
                            <img src={message.user === user ? userProfilePicture : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'} className='chatroom-message-avatar' alt='avatar' />
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
