function OutgoingFriendRequest({ friend, onDecline }) {
    return (
        <div className='friend-list-item-container'>
            <div className='friend-list-item'>
                <div className='friend-list-user-info'>
                    <img className='friend-list-item-avatar' src={friend.user.picture} alt='avatar' />
                    <div className='friend-list-item-text'>
                        <div className='friend-list-item-username'>{friend.user.username}</div>
                        <div className="friend-list-item-type">Outgoing Friend Request</div>
                    </div>
                </div>
                <div className='friend-list-buttons'>
                    <button className="friend-list-decline-button" onClick={(e) => onDecline(e, friend)}>
                        <span className="material-symbols-outlined friend-list-decline-button-icon">close</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

function IncomingFriendRequest({ friend, onDecline }) {
    return (
        <div className='friend-list-item-container'>
            <div className='friend-list-item'>
                <div className='friend-list-user-info'>
                    <img className='friend-list-item-avatar' src={friend.user.picture} alt='avatar' />
                    <div className='friend-list-item-text'>
                        <div className='friend-list-item-username'>{friend.user.username}</div>
                        <div className="friend-list-item-type">Incoming Friend Request</div>
                    </div>
                </div>
                <div className='friend-list-buttons'>
                    <button className="friend-list-accept-button">
                        <span className="material-symbols-outlined friend-list-accept-button-icon">check</span>
                    </button>
                    <button className="friend-list-decline-button" onClick={(e) => onDecline(e, friend)}>
                        <span className="material-symbols-outlined friend-list-decline-button-icon">close</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

function Friend({ friend }) {
    return (
        <div className='friend-list-item-container'>
            <div className='friend-list-item'>
                <div className='friend-list-user-info'>
                    <img className='friend-list-item-avatar' src={friend.user.picture} alt='avatar' />
                    <div className='friend-list-item-text'>
                        <div className='friend-list-item-username'>{friend.user.username}</div>
                        <div className="friend-list-item-type">Friend</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FriendRequestType({ friend, user }) {

    const handleDecline = async (e, friend) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/deleteRequest`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(friend),
            });
            if (response.ok) {
                console.log(`Deleted friend request`);
            } else {
                console.log(`Failed to delete friend request`);
            }
        } catch (error) {
            console.error(`Error fetching user's room: ${error}`);
        }
    };

    console.log(friend)

    if (friend.type === 'Incoming' && friend.status === 'pending') {
        return <IncomingFriendRequest friend={friend} onDecline={handleDecline} />
    }
    else if (friend.type === 'Outgoing' && friend.status === 'pending') {
        return <OutgoingFriendRequest friend={friend} onDecline={handleDecline} />
    }
    else if (friend.status === 'accept') {
        return <Friend friend={friend} />
    }
}

export default FriendRequestType;