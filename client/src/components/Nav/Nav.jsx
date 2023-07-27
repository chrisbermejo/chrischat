import useAuth from '../../hooks/useAuth';

function Nav({ fetchedConversations, currentConversationInfo, handleRoomClick }) {

    const { user, userProfilePicture, logout } = useAuth();

    return (
        <div className='Nav'>
            <div className='finder-container'>
                <button className='finder'>Find or start a conersation</button>
            </div>
            <div className='rooms-title'>
                <span className='rooms-title-text'>DIRECT MESSAGES</span>
                <span className='rooms-title-text plus-sign'>+</span>
            </div>
            <div className='rooms'>
                {fetchedConversations.map((conversation) => (
                    <div className={`room ${currentConversationInfo.conversationID === conversation.room ? 'current-room' : ''}`} key={conversation.name} onClick={() => { handleRoomClick(conversation) }}>
                        <div className='room-picture-container'>
                            <img className='room-picture' height={35} width={35} src={conversation.picture} />
                        </div>
                        <div className='room-information'>
                            <div className='room-name'>{conversation.name}</div>
                            <div className='room-user-count'>{conversation.users_count === 1 ? '1 Member' : `${conversation.users_count} Members`}</div>
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
    )
};

export default Nav;