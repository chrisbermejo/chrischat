import { useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import useInfo from '../../hooks/useInfo';
import AddFriend from '../FriendTab/AddFriend';
import FriendRequestType from '../FriendTab/FriendRequestType';

function Chat() {

    const DEFAULT_PICTURE = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
    const { user, userProfilePicture } = useAuth();
    const { conversationMessages, currentTab, chatMessage, profilePictures, friendList } = useInfo();

    useEffect(() => {
        if (chatMessage.current && currentTab.type !== 'conversations') {
            chatMessage.current.scrollIntoView();
        }
    }, [conversationMessages, currentTab.conversationID]);

    if (currentTab.type === 'chat') {
        return (
            <div className='chatroom-chat-container'>
                <div className='chatroom-chat'>
                    {(conversationMessages[currentTab.conversationID] || []).map((message, index) => (
                        <div key={index} ref={index === conversationMessages[currentTab.conversationID].length - 1 ? chatMessage : null} className={message.username === user ? 'chatroom-message-container client-con' : 'chatroom-message-container other-con'}>
                            <div className={message.username === user ? 'chatroom-message client' : 'chatroom-message other'}>
                                <div className='chatroom-message-username'>-{message.username}</div>
                                <div className='chatroom-message-text'>{message.message}</div>
                                <div className='chatroom-message-time'>{message.time}</div>
                            </div>
                            <img src={message.username === user ? userProfilePicture : profilePictures[message.username] || DEFAULT_PICTURE} className='chatroom-message-avatar' alt='avatar' />
                        </div>
                    ))}
                </div>
            </div >
        );
    } else if (currentTab.type === 'friend') {
        return (
            <div className='friend-tab'>
                <AddFriend />
                <div className='friend-list-header'>
                    <div className='friend-list-search-bar-container'>
                        <div className='friend-list-search-bar-wrapper'>
                            <input className='friend-list-search-bar' type='text' placeholder='Search' />
                        </div>
                        <div className='material-symbols-outlined search-bar-icon'>search</div>
                    </div>
                </div>
                <h5 className='friend-list-selection-header'>ONLINE - {friendList.length}</h5>
                {friendList.map((friend, index) => (
                    <FriendRequestType key={index} friend={friend} user={user} />
                ))}
                <div className='friend-list-footer'></div>
            </div>
        )
    }
};

export default Chat;