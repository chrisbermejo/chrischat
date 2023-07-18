import React, { useState, useEffect, useRef } from 'react';

import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';

import '../App.css';

const fetchRoom = async (user) => {
    const response = await fetch(`http://localhost:4000/room/${user}`, {
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
    const [fetchedRooms, setfetchedRooms] = useState([]);

    const [roomID, setRoomID] = useState('');
    const [roomName, setRoomName] = useState('');

    const chatMessage = useRef(null);

    const sendMessage = () => {
        if (message !== '') {

            socket.emit('join', roomID);

            socket.emit('send_message', {
                room: roomID,
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


    const fetchData = async (roomID) => {
        const response = await fetch(`http://localhost:4000/messages/room/${roomID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.json();
            setfetchedMessages(data);
        } else {
            console.log('failed');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    const leaveRoom = () => {
        if (roomID) {
            socket.emit('leave', roomID);
        }
    };

    useEffect(() => {
        if (socket && roomID) {

            socket.emit('join', roomID);

            console.log(socket)

            socket.on('receive_message', (data) => {
                console.log('message received')
                setMessages((prevMessages) => [...prevMessages, data]);
            });


        }

        return () => {
            if (socket) {
                socket.off('receive_message');
            }
        };
    }, [socket, roomID]);

    useEffect(() => {
        if (chatMessage.current) {
            chatMessage.current.scrollIntoView();
        }
    }, [messages, fetchedMessages]);

    useEffect(() => {

        if (user) {
            fetchRoom(user).then(data => {
                setfetchedRooms(data);
            });
        };

    }, []);

    return (
        <div className='App'>
            <div className='Nav'>
                {fetchedRooms.map((room, index) => (
                    <div key={room.name} onClick={() => { leaveRoom(); setRoomID(room.id); fetchData(room.id); setMessages([]); setRoomName(room.name); }}>
                        {room.name}
                    </div>
                ))}
            </div>
            <div className="chatroom">
                <h1 className='chatroom-title'>Messages</h1>
                <h4 className='chatroom-title'>{roomName}</h4>
                <div className='chatroom-chat-container'>
                    <div className='chatroom-chat'>
                        {fetchedMessages.map((message, index) => (
                            <div key={index} ref={index === fetchedMessages.length - 1 ? chatMessage : null} className={message.user === user ? 'chatroom-message-container client-con' : 'chatroom-message-container other-con'}>
                                <div className={message.user === user ? 'chatroom-message client' : 'chatroom-message other'}>
                                    <div className='chatroom-message-username'><span>-</span>{message.user === user ? user : message.user}</div>
                                    <div className='chatroom-message-text'>{message.message}</div>
                                    <div className='chatroom-message-time'>{message.time}</div>
                                </div>
                                <img src={message.user === user ? userProfilePicture : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'} className='chatroom-message-avatar' alt='avatar' />
                            </div>
                        ))}
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
        </div>
    );
}

export default Chatroom;
