import React, { createContext, useEffect, useState, useRef } from 'react';
import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';

export const InfoContext = createContext();

export const InfoProvider = ({ children }) => {

    //Socket info
    const { socket } = useSocket();
    //User info
    const { user, isAuthenticated, setIsAuthorized } = useAuth();
    //Probably rename this to Input
    const [message, setMessage] = useState('');
    //Stores user's rooms
    const [fetchedConversations, setFetchedConversations] = useState([]);
    //Stores messages for users' rooms
    const [conversationMessages, setConversationMessages] = useState({});
    //Stores profile pictures of users in users' rooms
    const [profilePictures, setProfilePictures] = useState({});
    //Store information on the current room in
    const [currentTab, setCurrentTab] = useState({
        type: 'friend',
        conversationID: null,
        conversationName: null,
        conversationPicture: null,
    });
    //Boolean for real time message 
    const [roomClicked, setRoomClicked] = useState({});

    const [friendList, setFriendList] = useState([])

    const chatMessage = useRef(null);

    const [addFriendVisible, setAddFriendVisible] = useState(false);

    const dialogRef = useRef(null);

    const [dialogType, setDialogType] = useState('');

    const openDialog = (type) => {
        setDialogType(type);
        dialogRef.current.showModal();
    };

    const handleFriendVisible = () => {
        setAddFriendVisible((prev) => { return !prev });
    };

    const sendMessage = () => {
        if (message !== '' && currentTab.conversationID !== null) {

            socket.emit('send_message', {
                chatid: currentTab.conversationID,
                username: user,
                message: message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });

        } else {
            return;
        }
    };

    const fetchRoomMessages = async (chatid, date) => {
        try {
            const response = await fetch((!date ? `http://localhost:8000/api/room/${chatid}/messages` : `http://localhost:8000/api/room/${chatid}/messages/?date=${date}`), {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.ok) {
                const data = await response.json();
                setConversationMessages((prevConversationMessages) => ({ ...prevConversationMessages, [chatid]: [...data, ...(prevConversationMessages[chatid] || [])] }));
            } else if (response.status === 401) {
                setIsAuthorized(false);
                console.log('Access Denied: You are not authorized to access this resource.');
            } else {
                console.log(`Failed to fetch room messages for room: ${chatid}`);
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
                data.sort((a, b) => new Date(b.recentmessagedate) - new Date(a.recentmessagedate));
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

    const fetchFriendList = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/user/friendlist`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setFriendList(data);
            }
            else if (response.status === 401) {
                setIsAuthorized(false);
                console.log('Access Denied: You are not authorized to access this resource.');
            } else {
                console.log(`Failed to fetch rooms for user`);
            }
        } catch (error) {
            console.error(`Error fetching user's room: ${error}`);
        }
    };

    const handleRoomClick = async (tab) => {
        if (isAuthenticated && tab.type === 'friend') {
            setCurrentTab((prevCurrentTab) => ({ ...prevCurrentTab, type: 'friend', conversationID: null, conversationName: null, conversationPicture: null }));
        } else if (isAuthenticated && ((tab.type === 'group') || (tab.type === 'private'))) {
            setCurrentTab((prevCurrentTab) => ({ ...prevCurrentTab, type: tab.type, conversationID: tab.chatid, conversationName: tab.chat_name, conversationPicture: tab.chat_picture }));
            if (!conversationMessages[tab.chatid] || !(roomClicked[tab.chatid] || false)) {
                await fetchRoomMessages(tab.chatid, conversationMessages[tab.chatid]?.[0]?.date);
                setRoomClicked((prev) => ({ ...prev, [tab.chatid]: true, }));
            }
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on('receive_message', (data) => {
                setConversationMessages((prevConversationMessages) => ({
                    ...prevConversationMessages,
                    [data.chatid]: [...(prevConversationMessages[data.chatid] || []), data],
                }));

                setFetchedConversations((prevRooms) => {
                    if (prevRooms.length > 0 && prevRooms[0].chatid === data.chatid) {
                        return prevRooms;
                    }
                    const updatedRooms = prevRooms.filter((r) => r.chatid !== data.chatid);
                    const roomToUpdate = prevRooms.find((r) => r.chatid === data.chatid);
                    return [roomToUpdate, ...updatedRooms];
                });
            });

            socket.on('receiveFriendRequest', (data) => {
                setFriendList((prev) => [...prev, data]);
            });

            socket.on('receiveDelcineRequest', (data) => {
                setFriendList((prevFriendList) => {
                    return prevFriendList.filter(
                        (friend) => !(friend.receiver.userid === data.receiver && friend.sender.userid === data.sender)
                    );
                });
            });

            socket.on('receiveAcceptRequest', (type, data, newChat) => {
                setFriendList((prevFriendList) => {
                    return prevFriendList.map((friend) => {
                        if (friend.receiver.userid === data.receiver && friend.sender.userid === data.sender) {
                            return { ...friend, status: 'accepted' };
                        }
                        return friend;
                    });
                });
                if (type) {
                    setFetchedConversations((prev) => [newChat, ...prev]);
                }
            });

            socket.on('receiveConversation', (data) => {
                setFetchedConversations((prev) => [data, ...prev]);
                dialogRef.current.close();
            });
        }

        return () => {
            if (socket) {
                socket.off('receive_message');
                socket.off('receiveFriendRequest');
                socket.off('receiveDelcineRequest');
            }
        };
    }, [socket]);

    // eslint-disable-next-line
    useEffect(() => {
        if (isAuthenticated && user && socket) {
            fetchRoom();
            fetchFriendList();
        };
        // eslint-disable-next-line
    }, [isAuthenticated, user, socket]);


    useEffect(() => {
        if (fetchedConversations.length > 0 && socket) {
            fetchedConversations.forEach((conversations) => {
                socket.emit('join', conversations.chatid, user);
            });
        };
    }, [fetchedConversations]);

    useEffect(() => {
        console.log(friendList)
        console.log(fetchedConversations)
        console.log(currentTab)
    }
        , [currentTab])


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
            currentTab,
            setCurrentTab,
            chatMessage,
            sendMessage,
            fetchRoomMessages,
            fetchRoom,
            handleRoomClick,
            friendList,
            setFriendList,
            addFriendVisible,
            handleFriendVisible,
            dialogRef,
            dialogType,
            setDialogType,
            openDialog,
        }}>
            {children}
        </InfoContext.Provider>
    );
};