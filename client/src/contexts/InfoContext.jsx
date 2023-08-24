import React, { createContext, useEffect, useState, useRef } from 'react';
import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

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
        participantsList: null
    });
    //Current Filter on friendlist
    const [filter, setFilter] = useState('all');
    //Boolean for real time message 
    const [roomClicked, setRoomClicked] = useState({});

    const [friendList, setFriendList] = useState([]);

    const [filterFriendList, setFilterFriendList] = useState([]);

    const chatMessage = useRef(null);

    const [addFriendVisible, setAddFriendVisible] = useState(false);

    const dialogRef = useRef(null);

    const [dialogType, setDialogType] = useState('');

    const openDialog = (type) => {
        setDialogType(type);
        if (type !== 'NONE') {
            dialogRef.current.showModal();
        }
    };

    const handleFriendVisible = () => {
        setAddFriendVisible((prev) => { return !prev });
    };

    function customSort(a, b) {
        const getStatusOrder = (status) => {
            if (status === 'accepted') return 1;
            if (status === 'pending') return 3;
            return 2;
        };

        const isOnline = (user) => user && user.online === true;

        if (getStatusOrder(a.status) !== getStatusOrder(b.status)) {
            return getStatusOrder(a.status) - getStatusOrder(b.status);
        }

        if (a.status !== 'pending' && b.status !== 'pending') {
            if (isOnline(a.sender) !== isOnline(b.sender)) {
                return isOnline(b.sender) - isOnline(a.sender);
            }

            if (isOnline(a.receiver) !== isOnline(b.receiver)) {
                return isOnline(b.receiver) - isOnline(a.receiver);
            }
        }

        const usernameA = (a.sender.username !== user && a.sender.username) || (a.receiver.username !== user && a.receiver.username);
        const usernameB = (b.sender.username !== user && b.sender.username) || (b.receiver.username !== user && b.receiver.username);
        return usernameA.localeCompare(usernameB);
    }

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
                data.forEach((room) => {
                    if (room.type === 'private') {
                        setProfilePictures((prevProfilePictures) => ({ ...prevProfilePictures, [room.chat_name]: room.chat_picture }));
                    }
                });
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
                data.sort(customSort);
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

    const fetchProfilePictureForUser = async (username) => {
        try {
            console.log('fetching for user:', username)
            const response = await fetch(`http://localhost:8000/api/user/${username}/profilePicture`);

            if (response.ok) {
                const data = await response.json();
                setProfilePictures((prevProfilePictures) => ({ ...prevProfilePictures, [username]: data }));
            } else {
                console.log(`Failed to fetch profile picture for user: ${username}`);
            }
        } catch (error) {
            console.error('Error fetching profile picture:', error);
        }
    };

    const fetchParticipantsProfilePictures = async (participantsList) => {
        if (currentTab.type === 'group') {
            for (const username in participantsList) {
                if (participantsList[username] !== user && !profilePictures[participantsList[username]]) {
                    await fetchProfilePictureForUser(participantsList[username]);
                }
            }
        }
    };

    const fetchingRoomAndFriendList = useQuery({
        queryKey: ['fetchingRoomAndFriendList', user],
        queryFn: async () => {
            await fetchRoom();
            await fetchFriendList();
            return true;
        },
        refetchOnWindowFocus: false,
        enabled: false,
    });

    const fetchingRoomMessages = useQuery({
        queryKey: ['fetchingRoomMessages', currentTab.conversationID],
        queryFn: async () => {
            await fetchRoomMessages(currentTab.conversationID, conversationMessages[currentTab.conversationID]?.[0]?.date);
            await fetchParticipantsProfilePictures(currentTab.participantsList);
            setRoomClicked((prev) => ({ ...prev, [currentTab.conversationID]: true, }));
            return true;
        },
        refetchOnWindowFocus: false,
        enabled: currentTab.conversationID !== null && (!conversationMessages[currentTab.conversationID] || !(roomClicked[currentTab.conversationID] || false)),
    });

    const handleRoomClick = async (tab) => {
        if (isAuthenticated && tab.type === 'friend') {
            setCurrentTab((prevCurrentTab) => ({ ...prevCurrentTab, type: 'friend', conversationID: null, conversationName: null, conversationPicture: null, participantsList: null }));
        } else if (isAuthenticated && ((tab.type === 'group') || (tab.type === 'private'))) {
            setCurrentTab((prevCurrentTab) => ({ ...prevCurrentTab, type: tab.type, conversationID: tab.chatid, conversationName: tab.chat_name, conversationPicture: tab.chat_picture, participantsList: tab.participants }));
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
                setFriendList((prevFriendList) => {
                    return prevFriendList.sort(customSort);
                });
            });

            socket.on('receiveDelcineRequest', (data) => {
                setFriendList((prevFriendList) => {
                    return prevFriendList.filter(
                        (friend) => !(friend.receiver.userid === data.receiver && friend.sender.userid === data.sender)
                    );
                });
                setFriendList((prevFriendList) => {
                    return prevFriendList.sort(customSort);
                });
            });

            socket.on('receiveAcceptRequest', (type, data, newChat, onlineStatus) => {
                setFriendList((prevFriendList) => {
                    return prevFriendList.map((friend) => {
                        if (friend.receiver.userid === data.receiver && friend.sender.userid === data.sender) {
                            if (friend.receiver.username === user) {
                                return { ...friend, status: 'accepted', sender: { ...friend.sender, online: onlineStatus } };
                            } else if (friend.sender.username === user) {
                                return { ...friend, status: 'accepted', receiver: { ...friend.receiver, online: onlineStatus } };
                            }
                        }
                        return friend;
                    });
                });
                if (type) {
                    setFetchedConversations((prev) => [newChat, ...prev]);
                    setProfilePictures((prevProfilePictures) => ({ ...prevProfilePictures, [newChat.chat_name]: newChat.chat_picture }));
                }
                setFriendList((prevFriendList) => {
                    return prevFriendList.sort(customSort);
                });
            });

            socket.on('receiveConversation', (data) => {
                setFetchedConversations((prev) => [data, ...prev]);
                dialogRef.current.close();
            });

            socket.on('receiveRemoveFriend', (data) => {
                setFriendList((prevFriendList) => {
                    return prevFriendList.filter(
                        (friend) => !(friend.receiver.userid === data.receiver.userid && friend.sender.userid === data.sender.userid)
                    );
                });
                setFriendList((prevFriendList) => {
                    return prevFriendList.sort(customSort);
                });
            });

            socket.on('updateFriendList', (connectedUser, online) => {
                if (user !== connectedUser.username) {
                    setFriendList((prevFriendList) => {
                        return prevFriendList.map((friend) => {
                            if (friend.receiver.userid === connectedUser.userid || friend.sender.userid === connectedUser.userid) {
                                if (friend.receiver.userid === connectedUser.userid) {
                                    return { ...friend, receiver: { ...friend.receiver, online: online } };
                                } else {
                                    return { ...friend, sender: { ...friend.sender, online: online } };
                                }
                            }
                            return friend;
                        });
                    });
                    setFetchedConversations((prevFetchedConversations) => {
                        return prevFetchedConversations.map((friendList) => {
                            if (friendList.type === 'private' && friendList.chat_name === connectedUser.username) {
                                return { ...friendList, online: online };
                            }
                            return friendList;
                        });
                    });
                    setFriendList((prevFriendList) => {
                        return prevFriendList.sort(customSort);
                    });
                }
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
            fetchingRoomAndFriendList.refetch();
        };
        // eslint-disable-next-line
    }, [isAuthenticated, user, socket]);

    useEffect(() => {
        setCurrentTab({
            type: 'friend',
            conversationID: null,
            conversationName: null,
            conversationPicture: null,
            participantsList: null
        });
        setFilter('all');
    }, [])

    useEffect(() => {
        if (fetchedConversations.length > 0 && socket) {
            fetchedConversations.forEach((conversations) => {
                socket.emit('join', conversations.chatid, user);
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
            currentTab,
            setCurrentTab,
            chatMessage,
            sendMessage,
            fetchRoomMessages,
            handleRoomClick,
            friendList,
            setFriendList,
            addFriendVisible,
            handleFriendVisible,
            dialogRef,
            dialogType,
            setDialogType,
            openDialog,
            fetchingRoomAndFriendList,
            fetchingRoomMessages,
            filter,
            setFilter,
            filterFriendList,
            setFilterFriendList
        }}>
            {children}
        </InfoContext.Provider>
    );
};