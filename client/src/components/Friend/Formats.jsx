export function OutgoingFriendRequest({ friend, onDecline }) {
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

export function IncomingFriendRequest({ friend, onDecline, onAccept }) {
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

export function Friend({ type, friendInfo, onRemoveFriend }) {

    let friend = null;
    const users = {
        sender: null,
        receiver: null
    };
    if (type === 'receiver') {
        friend = friendInfo.receiver;
        users.receiver = friend;
        users.sender = friendInfo.sender;
    } else if (type === 'sender') {
        friend = friendInfo.sender;
        users.sender = friend;
        users.receiver = friendInfo.receiver;
    };

    return (
        <div className='friend-list-item'>
            <div className='friend-list-user-info'>
                <div className="friend-list-item-avatar-container">
                    <img className='friend-list-item-avatar' src={friend.picture} alt='avatar' />
                    <div className={friend.online ? 'friend-list-item-avatar-status active-color-status' : 'friend-list-item-avatar-status offline-color-status'}></div>
                </div>
                <div className='friend-list-item-text'>
                    <div className='friend-list-item-username'>{friend.username}</div>
                    <div className="friend-list-item-type">{friend.online ? "Online" : 'Offline'}</div>
                </div>
            </div>
            <div className='friend-list-buttons'>
                <button className="friend-list-decline-button" onClick={(e) => onRemoveFriend(e, users)}>
                    <span className="material-symbols-outlined friend-list-decline-button-icon">person_remove</span>
                </button>
            </div>
        </div>
    );
};