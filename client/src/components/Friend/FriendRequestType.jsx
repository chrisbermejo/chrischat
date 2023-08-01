function OutgoingFriendRequest({ friend, onDecline }) {
    return (
        <div className='friend-list-item'>
            <div className='friend-list-user-info'>
                <img className='friend-list-item-avatar' src={friend.receiver.picture} alt='avatar' />
                <div className='friend-list-item-text'>
                    <div className='friend-list-item-username'>{friend.receiver.username}</div>
                    <div className="friend-list-item-type">Outgoing Friend Request</div>
                </div>
            </div>
            <div className='friend-list-buttons'>
                <button className="friend-list-decline-button" onClick={(e) => onDecline(e, { receiver: friend.receiver.userid, sender: friend.sender.userid })}>
                    <span className="material-symbols-outlined friend-list-decline-button-icon">close</span>
                </button>
            </div>
        </div>
    );
};

function IncomingFriendRequest({ friend, onDecline, onAccept }) {
    return (
        <div className='friend-list-item'>
            <div className='friend-list-user-info'>
                <img className='friend-list-item-avatar' src={friend.sender.picture} alt='avatar' />
                <div className='friend-list-item-text'>
                    <div className='friend-list-item-username'>{friend.sender.username}</div>
                    <div className="friend-list-item-type">Incoming Friend Request</div>
                </div>
            </div>
            <div className='friend-list-buttons'>
                <button className="friend-list-accept-button" onClick={(e) => onAccept(e, { receiver: friend.receiver.userid, sender: friend.sender.userid })}>
                    <span className="material-symbols-outlined friend-list-accept-button-icon">check</span>
                </button>
                <button className="friend-list-decline-button" onClick={(e) => onDecline(e, { receiver: friend.receiver.userid, sender: friend.sender.userid })}>
                    <span className="material-symbols-outlined friend-list-decline-button-icon">close</span>
                </button>
            </div>
        </div>
    );
};

function Friend({ friend }) {

    return (
        <div className='friend-list-item'>
            <div className='friend-list-user-info'>
                <img className='friend-list-item-avatar' src={friend.picture} alt='avatar' />
                <div className='friend-list-item-text'>
                    <div className='friend-list-item-username'>{friend.username}</div>
                    <div className="friend-list-item-type">Friend</div>
                </div>
            </div>
        </div>
    );
};

function FriendRequestType({ friend, user, setFriendList, socket, setFetchedConversations }) {

    const handleDecline = async (e, users) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/deleteRequest`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(users),
            });
            if (response.ok) {
                setFriendList((prevFriendList) => {
                    return prevFriendList.filter(
                        (friend) => !(friend.receiver.userid === users.receiver && friend.sender.userid === users.sender)
                    );
                });
                friend.receiver.username === user
                    ? socket.emit('sendDelcineRequest', friend.sender.username, users)
                    : socket.emit('sendDelcineRequest', friend.receiver.username, users);
            } else {
                console.log(`Failed to delete friend request`);
            }
        } catch (error) {
            console.error(`Error fetching user's room: ${error}`);
        }
    };

    const handleAccept = async (e, users) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/acceptRequest`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(users),
            });
            if (response.ok) {
                const data = await response.json();
                setFetchedConversations((prev) => [data.forReceiver, ...prev]);
                setFriendList((prevFriendList) => {
                    return prevFriendList.map((friend) => {
                        if (friend.receiver.userid === users.receiver && friend.sender.userid === users.sender) {
                            return { ...friend, status: 'accepted' };
                        }
                        return friend;
                    });
                });
                socket.emit('sendAcceptRequest', friend.sender.username, users, data.forSender)
            } else {
                console.log(`Failed to accept friend request`);
            }
        } catch (error) {
            console.error(`Error accepting friend request: ${error}`);
        }
    };

    if (friend.receiver.username === user && friend.status === 'pending') {
        return <IncomingFriendRequest friend={friend} onDecline={handleDecline} onAccept={handleAccept} />
    }
    else if (friend.sender.username === user && friend.status === 'pending') {
        return <OutgoingFriendRequest friend={friend} onDecline={handleDecline} />
    }
    else if (friend.receiver.username === user && friend.status === 'accepted') {
        return <Friend friend={friend.sender} />
    }
    else if (friend.sender.username === user && friend.status === 'accepted') {
        return <Friend friend={friend.receiver} />
    }
};

export default FriendRequestType;