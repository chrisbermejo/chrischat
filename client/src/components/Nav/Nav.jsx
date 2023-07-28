import useAuth from '../../hooks/useAuth';
import { GroupLayout, DmLayout } from './ConversationLayout';

function Nav({ fetchedConversations, currentConversationInfo, handleRoomClick }) {

    const { user, userProfilePicture, logout } = useAuth();

    return (
        <div className='Nav'>
            <div className='finder-container'>
                <button className='finder'>Find or start a conersation</button>
            </div>
            <div className='friend-container'>
                <div className='friend-button'>
                    <span className="friend-logo material-symbols-outlined">group</span>
                    <span>Friends</span>
                </div>
            </div>
            <div className='rooms-title'>
                <span className='rooms-title-text'>DIRECT MESSAGES</span>
                <span className='rooms-title-text plus-sign'>+</span>
            </div>
            <div className='rooms'>
                {fetchedConversations.map((conversation, index) => (
                    conversation.isGroupChat === true
                        ? <GroupLayout key={`Conversation${index}`} conversation={conversation} currentConversationInfo={currentConversationInfo} handleRoomClick={handleRoomClick} />
                        : <DmLayout key={`Conversation${index}`} conversation={conversation} currentConversationInfo={currentConversationInfo} handleRoomClick={handleRoomClick} />
                ))}
            </div>
            <div className='nav-footer'>
                <div className='user-info-container'>
                    <div className='user-info'>
                        <img src={userProfilePicture} className='user--avatar' alt={user} />
                        <div className='user--name'>
                            {user}
                        </div>
                    </div>
                    <div className='setting-container'>
                        <button className='setting-button' onClick={() => { logout(); }}>
                            <span className="material-symbols-outlined">
                                settings
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Nav;