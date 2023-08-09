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

export function Friend({ friend }) {

    return (
        <div className='friend-list-item'>
            <div className='friend-list-user-info'>
                <img className='friend-list-item-avatar' src={friend.picture} alt='avatar' />
                <div className='friend-list-item-text'>
                    <div className='friend-list-item-username'>{friend.username}</div>
                    <div className="friend-list-item-type">Friend</div>
                </div>
            </div>
            <div className='friend-list-buttons'>
                <button className="friend-list-decline-button">
                    <span className="material-symbols-outlined friend-list-decline-button-icon">person_remove</span>
                </button>
            </div>
        </div>
    );
};