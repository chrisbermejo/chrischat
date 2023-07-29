function OutgoingFriendRequest({ friend }) {
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
                    <button className="friend-list-decline-button">
                        <span className="material-symbols-outlined friend-list-decline-button-icon">close</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

function IncomingFriendRequest({ friend }) {
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
                    <button className="friend-list-decline-button">
                        <span className="material-symbols-outlined friend-list-decline-button-icon">close</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

function FriendRequestType({ friend, user }) {
    if (friend.status === 'pending' && friend.sender.username !== user) {
        return <IncomingFriendRequest friend={friend} />
    }
    if (friend.status === 'pending' && friend.sender.username === user) {
        return <OutgoingFriendRequest friend={friend} />
    }
}

export default FriendRequestType;