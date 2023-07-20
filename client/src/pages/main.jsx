import React, { useState, useEffect, useRef } from 'react';

import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';

import '../App.css';

function Chatroom() {

    const DEFAULT_PICTURE = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'

    //Socket info
    const { socket, socketID } = useSocket();

    //User info
    const { user, userProfilePicture, logout } = useAuth();

    //Probably rename this to Input
    const [message, setMessage] = useState('');

    const [fetchedRooms, setfetchedRooms] = useState([]);
    const [roomMessages, setRoomMessages] = useState({});

    const [profilePictures, setProfilePictures] = useState({});

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

        } else {
            return;
        }
    };

    const fetchRoomMessages = async (roomID) => {
        const response = await fetch(`http://localhost:4000/api/room/${roomID}/messages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.json();
            setRoomMessages((prevRoomMessages) => ({ ...prevRoomMessages, [roomID]: data }));
        }

        else {
            console.log('failed');
        }
    };

    const fetchRoom = async (user) => {
        const response = await fetch(`http://localhost:4000/api/user/${user}/rooms`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            const data = await response.json();
            setfetchedRooms(data);
        } else {
            console.log('failed');
        }
    };

    const fetchProfilePictureForUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:4000/api/user/${userId}/profilePicture`);

            if (response.ok) {
                const data = await response.json();
                setProfilePictures((prevProfilePictures) => ({ ...prevProfilePictures, [userId]: data }));
            } else {
                console.log(`Failed to fetch profile picture for user: ${userId}`);
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            e.target.rows = e.target.rows + 1;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
            setMessage('');
        }
    };

    const handleRoomClick = async (room) => {
        setRoomID(room.id);
        setRoomName(room.name);

        if (!roomMessages[room.id]) {
            await fetchRoomMessages(room.id);
        }

        room.users.forEach((userId) => {
            if (!profilePictures[userId]) {
                fetchProfilePictureForUser(userId);
            }
        });
    };

    useEffect(() => {
        if (socket && roomID) {

            socket.emit('join', roomID);

            socket.on('receive_message', (data) => {
                setRoomMessages((prevRoomMessages) => ({ ...prevRoomMessages, [data.room]: [...(prevRoomMessages[data.room] || []), data] }));
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
            console.log(profilePictures)
        }
    }, [roomMessages]);

    useEffect(() => {

        if (user) {
            fetchRoom(user);
        };

    }, []);

    return (
        <div className='App'>
            <div className='Nav'>
                <div className='rooms'>
                    {fetchedRooms.map((room) => (
                        <div className='room' key={room.name} onClick={() => { handleRoomClick(room) }}>
                            {room.name}
                        </div>
                    ))}
                </div>
                <div className='user-info-container'>
                    <div className='user-info'>
                        <img height={50} src={userProfilePicture} className='user-info-avatar' alt='avatar' />
                        <div>
                            <div> {user} </div>
                            <div>
                                <button onClick={() => { logout(); }}> Logout </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="chatroom">
                <h1 className='chatroom-title'>{roomName}</h1>
                <div className='chatroom-chat-container'>
                    <div className='chatroom-chat'>
                        {(roomMessages[roomID] || []).map((message, index) => (
                            <div key={index} ref={index === roomMessages[roomID].length - 1 ? chatMessage : null} className={message.user === user ? 'chatroom-message-container client-con' : 'chatroom-message-container other-con'}>
                                <div className={message.user === user ? 'chatroom-message client' : 'chatroom-message other'}>
                                    <div className='chatroom-message-username'>-{message.user}</div>
                                    <div className='chatroom-message-text'>{message.message}</div>
                                    <div className='chatroom-message-time'>{message.time}</div>
                                </div>
                                <img src={message.user === user ? userProfilePicture : profilePictures[message.user] || DEFAULT_PICTURE} className='chatroom-message-avatar' alt='avatar' />
                            </div>
                        ))}
                    </div>
                </div>
                <div className='chatroom-inputs-container'>
                    <textarea
                        rows={1}
                        className='chatroom-input'
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