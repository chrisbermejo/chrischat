import useAuth from '../../hooks/useAuth';
import useInfo from '../../hooks/useInfo';
import { GroupLayout, DmLayout } from './ConversationLayout';

function Nav() {

    const { user, userProfilePicture } = useAuth();
    const { fetchedConversations, currentTab, handleRoomClick, openDialog } = useInfo();

    return (
        <div className='Nav'>
            <div className='finder-container'>
                <a href='https://github.com/chrisbermejo' target="_blank" rel="noreferrer" className='finder'>Created by Christopher B</a>
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
                <span className='rooms-title-text plus-sign' onClick={() => openDialog('create-dm')}>+</span>
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
                    <div className='user-info' onClick={() => openDialog('setting')}>
                        <div className='user--profile-picture'>
                            <img src={userProfilePicture} className='user--avatar' alt={user} />
                            <div className='user--status-active'></div>
                        </div>
                        <div className='user--name'>
                            <span className='user-name-text'>{user}</span>
                            <span className='user-name-status'>Online</span>
                        </div>
                    </div>
                    <div className='setting-container'>
                        <button className='setting-button open-logout-button' onClick={() => openDialog('logout')}>
                            <span className='material-symbols-outlined'>logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Nav;