import React, { useState, useEffect, useRef } from 'react';

import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';

import '../App.css';

function Chatroom() {

    const DEFAULT_PICTURE = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    //Socket info
    const { socket, socketID } = useSocket();
    //User info
    const { user, userProfilePicture, logout, checkToken } = useAuth();
    //Probably rename this to Input
    const [message, setMessage] = useState('');
    //Stores user's rooms
    const [fetchedRooms, setfetchedRooms] = useState([]);
    //Stores messages for users' rooms
    const [roomMessages, setRoomMessages] = useState({});
    //Stores profile pictures of users in users' rooms
    const [profilePictures, setProfilePictures] = useState({});
    //Store information on the current room in
    const [currentRoomInfo, setCurrentRoomInfo] = useState({
        roomID: null,
        roomName: null,
        roomPicture: null,
    });

    const [isAuthorized, setIsAuthorized] = useState(true);

    const chatMessage = useRef(null);

    const sendMessage = () => {
        if (message !== '') {

            socket.emit('join', currentRoomInfo.roomID);

            socket.emit('send_message', {
                room: currentRoomInfo.roomID,
                id: socketID,
                user: user,
                message: message,
                date: new Date().toLocaleString('en-US', {
                    timeZone: 'America/New_York',
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour12: true,
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit'
                }),
                time: new Date().toLocaleString('en-US', {
                    timeZone: 'America/New_York',
                    hour12: true,
                    hour: 'numeric',
                    minute: '2-digit'
                }),
            });

        } else {
            return;
        }
    };

    const fetchRoomMessages = async (roomID) => {
        try {
            const response = await fetch(`http://localhost:8000/api/room/${roomID}/messages`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.ok) {
                const data = await response.json();
                setRoomMessages((prevRoomMessages) => ({ ...prevRoomMessages, [roomID]: data }));
            } else if (response.status === 401) {
                setIsAuthorized(false);
                console.log('Access Denied: You are not authorized to access this resource.');
            } else {
                console.log(`Failed to fetch room messages for room: ${roomID}`);
            }
        } catch (error) {
            console.error('Error fetching room messages:', error);
        }
    };

    const fetchProfilePictureForUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/user/${userId}/profilePicture`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProfilePictures((prevProfilePictures) => ({ ...prevProfilePictures, [userId]: data }));
            } else if (response.status === 401) {
                setIsAuthorized(false);
                console.log('Access Denied: You are not authorized to access this resource.');
            } else {
                console.log(`Failed to fetch profile picture for user: ${userId}`);
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
        }
    };

    const fetchRoom = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/user/rooms`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                data.sort((a, b) => new Date(b.mostRecentMessageDate) - new Date(a.mostRecentMessageDate));
                setfetchedRooms(data);
            } else if (response.status === 401) {
                setIsAuthorized(false);
                console.log('Access Denied: You are not authorized to access this resource.');
            } else {
                console.log(`Failed to fetch rooms for user`);
            }
        } catch (error) {
            console.error(`Error fetching user's room: ${error}`);
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
        if (isAuthorized) {
            setCurrentRoomInfo((prevProfilePictures) => ({ ...prevProfilePictures, roomID: room.id, roomName: room.name, roomPicture: room.picture }));

            if (!roomMessages[room.id]) {
                await fetchRoomMessages(room.id);
            }

            room.users.forEach((userId) => {
                if (!profilePictures[userId]) {
                    fetchProfilePictureForUser(userId);
                }
            });
        }
    };

    useEffect(() => {
        if (socket && currentRoomInfo.roomID) {

            socket.emit('join', currentRoomInfo.roomID);


            //data.room is the room ID
            //data is the recieve message

            //prevRooms.id is the room ID
            //prevRooms is the fetched room object
            socket.on('receive_message', (data) => {

                setRoomMessages((prevRoomMessages) => ({
                    ...prevRoomMessages,
                    [data.room]: [...(prevRoomMessages[data.room] || []), data],
                }));

                setfetchedRooms((prevRooms) => {
                    if (prevRooms.length > 0 && prevRooms[0].id === data.room) {
                        return prevRooms;
                    }
                    const updatedRooms = prevRooms.filter((r) => r.id !== data.room);
                    const roomToUpdate = prevRooms.find((r) => r.id === data.room);
                    return [roomToUpdate, ...updatedRooms];
                });
            });
        }

        return () => {
            if (socket) {
                socket.off('receive_message');
            }
        };
    }, [socket, currentRoomInfo.roomID]);

    useEffect(() => {
        if (chatMessage.current) {
            chatMessage.current.scrollIntoView();
        }
    }, [roomMessages, currentRoomInfo.roomID]);

    useEffect(() => {
        if (user) {
            fetchRoom(user);
        };
    }, []);

    return (
        <div className='App'>
            <div className='Nav'>
                <div className='finder-container'>
                    <button className='finder'>Find or start a conersation</button>
                </div>
                <div className='rooms-title'>
                    <span className='rooms-title-text'>DIRECT MESSAGES</span>
                    <span className='rooms-title-text plus-sign'>+</span>
                </div>
                <div className='rooms'>
                    {fetchedRooms.map((room) => (
                        <div className={`room ${currentRoomInfo.roomID === room.id ? 'current-room' : ''}`} key={room.name} onClick={() => { handleRoomClick(room) }}>
                            <div className='room-picture-container'>
                                <img className='room-picture' height={35} width={35} src={room.picture} />
                            </div>
                            <div className='room-information'>
                                <div className='room-name'>{room.name}</div>
                                <div className='room-user-count'>{room.users_count === 1 ? '1 Member' : `${room.users_count} Members`}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='user-info-container'>
                    <div className='user-info'>
                        <img height={50} src={userProfilePicture} className='user-info-avatar' alt='avatar' />
                        <div>
                            <div>
                                {user}
                            </div>
                            <div>
                                <button onClick={() => { logout(); }}> Logout </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="chatroom">
                <div className='chatroom-title-container-container'>
                    <div className='chatroom-title-container'>
                        {currentRoomInfo.roomPicture !== null ? <img className='chatroom-title-picture' height={40} width={40} src={currentRoomInfo.roomPicture} alt='room-picture' /> : null}
                        <h2 className='chatroom-title'>{currentRoomInfo.roomName}</h2>
                    </div>
                </div>
                <div className='chatroom-chat-container'>
                    <div className='chatroom-chat'>
                        {(roomMessages[currentRoomInfo.roomID] || []).map((message, index) => (
                            <div key={index} ref={index === roomMessages[currentRoomInfo.roomID].length - 1 ? chatMessage : null} className={message.user === user ? 'chatroom-message-container client-con' : 'chatroom-message-container other-con'}>
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
        </div >
    );
}

export default Chatroom;