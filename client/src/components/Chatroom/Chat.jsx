import { useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import useInfo from '../../hooks/useInfo';

function ChatRoom() {

    const DEFAULT_PICTURE = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
    const { user, userProfilePicture } = useAuth();
    const { conversationMessages, currentTab, chatMessage, profilePictures, fetchingRoomMessages } = useInfo();

    useEffect(() => {
        if (chatMessage.current && currentTab.type !== 'conversations') {
            chatMessage.current.scrollIntoView();
        }
    }, [conversationMessages, chatMessage, currentTab.type, currentTab.conversationID]);

    if (fetchingRoomMessages.isLoading) {
        const skeletonItems = Array.from({ length: 20 }, (_, index) => (
            <div key={index} className='chatroom-message-container other-con' >
                <div className='chatroom-message other skeleton-message'></div>
                <div className='chatroom-message-avatar'></div>
            </div>
        ));

        return (
            <div className='chatroom-chat-container'>
                <div className='chatroom-chat'>
                    {skeletonItems}
                    <div className='chatroom-message-container other-con' ref={chatMessage}>
                        <div className='chatroom-message other skeleton-message'></div>
                        <div className='chatroom-message-avatar'></div>
                    </div>
                </div>
            </div>
        );
    }

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
};

export default ChatRoom;