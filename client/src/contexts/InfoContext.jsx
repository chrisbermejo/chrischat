import React, { createContext, useEffect, useState, useRef } from 'react';
import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';

export const InfoContext = createContext();

export const InfoProvider = ({ children }) => {

    //Socket info
    const { socket, socketID } = useSocket();
    //User info
    const { user } = useAuth();
    //Probably rename this to Input
    const [message, setMessage] = useState('');
    //Stores user's rooms
    const [fetchedConversations, setFetchedConversations] = useState([]);
    //Stores messages for users' rooms
    const [conversationMessages, setConversationMessages] = useState({});
    //Stores profile pictures of users in users' rooms
    const [profilePictures, setProfilePictures] = useState({});
    //Store information on the current room in
    const [currentConversationInfo, setCurrentConversationInfo] = useState({
        conversationID: 'null',
        conversationName: null,
        conversationPicture: null,
    });

    const [isAuthorized, setIsAuthorized] = useState(true);

    const chatMessage = useRef(null);

    const sendMessage = () => {
        if (message !== '' && currentConversationInfo.conversationID !== null) {

            // socket.emit('join', currentConversationInfo.conversationID, user);

            socket.emit('send_message', {
                room: currentConversationInfo.conversationID,
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
                setConversationMessages((prevConversationMessages) => ({ ...prevConversationMessages, [roomID]: data }));
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

    // const fetchProfilePictureForUser = async (userId) => {
    //     try {
    //         const response = await fetch(`http://localhost:8000/api/user/${userId}/profilePicture`, {
    //             method: 'GET',
    //             credentials: 'include',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //         });

    //         if (response.ok) {
    //             const data = await response.json();
    //             setProfilePictures((prevProfilePictures) => ({ ...prevProfilePictures, [userId]: data }));
    //         } else if (response.status === 401) {
    //             setIsAuthorized(false);
    //             console.log('Access Denied: You are not authorized to access this resource.');
    //         } else {
    //             console.log(`Failed to fetch profile picture for user: ${userId}`);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching profile picture:', error);
    //     }
    // };

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
                setFetchedConversations(data);
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

    const handleRoomClick = async (conversation, conversationPicture, conversationName) => {
        if (isAuthorized) {
            setCurrentConversationInfo((prevCurrentConversationInfo) => ({ ...prevCurrentConversationInfo, conversationID: conversation.room, conversationName: conversationName, conversationPicture: conversationPicture }));
            if (!conversationMessages[conversation.room]) {
                await fetchRoomMessages(conversation.room);
            }
            conversation.users.forEach((userId) => {
                setProfilePictures((prevProfilePictures) => ({ ...prevProfilePictures, [userId.username]: userId.picture }));
            });
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on('receive_message', (data) => {
                setConversationMessages((prevConversationMessages) => ({
                    ...prevConversationMessages,
                    [data.room]: [...(prevConversationMessages[data.room] || []), data],
                }));

                setFetchedConversations((prevRooms) => {
                    if (prevRooms.length > 0 && prevRooms[0].room === data.room) {
                        return prevRooms;
                    }
                    const updatedRooms = prevRooms.filter((r) => r.room !== data.room);
                    const roomToUpdate = prevRooms.find((r) => r.room === data.room);
                    return [roomToUpdate, ...updatedRooms];
                });
            });
        }

        return () => {
            if (socket) {
                socket.off('receive_message');
            }
        };
    }, [socket]);

    useEffect(() => {
        if (user) {
            fetchRoom();
        };
    }, []);

    useEffect(() => {
        if (fetchedConversations.length > 0 && socket) {
            console.log(fetchedConversations)
            fetchedConversations.forEach((conversations) => {
                socket.emit('join', conversations.room, user);
            });
        };
    }, [fetchedConversations]);


    return (
        <InfoContext.Provider value={{
            message,
            setMessage,
            fetchedConversations,
            setFetchedConversations,
            setProfilePictures,
            profilePictures,
            conversationMessages,
            setConversationMessages,
            currentConversationInfo,
            setCurrentConversationInfo,
            chatMessage,
            isAuthorized,
            setIsAuthorized,
            sendMessage,
            fetchRoomMessages,
            fetchRoom,
            handleRoomClick
        }}>
            {children}
        </InfoContext.Provider>
    );
};