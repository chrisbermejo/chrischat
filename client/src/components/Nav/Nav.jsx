import useAuth from '../../hooks/useAuth';
import useInfo from '../../hooks/useInfo';
import { GroupLayout, DmLayout } from './ConversationLayout';

function Nav() {

    const { user, userProfilePicture, logout } = useAuth();
    const { fetchedConversations, currentTab, handleRoomClick } = useInfo();

    return (
        <div className='Nav'>
            <div className='finder-container'>
                <a href='https://github.com/chrisbermejo' target="_blank" className='finder'>Created by Christopher B</a>
            </div>
            <div className='friend-container'>
                <div className={`friend-button ${currentTab.type === 'friend' ? 'current-room' : ''}`} onClick={() => {
                    handleRoomClick({ type: 'friend' })
                }}>
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
                    conversation.type === "group"
                        ? <GroupLayout key={`Conversation${index}`} conversation={conversation} currentTab={currentTab} handleRoomClick={handleRoomClick} />
                        : <DmLayout key={`Conversation${index}`} conversation={conversation} currentTab={currentTab} handleRoomClick={handleRoomClick} />
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