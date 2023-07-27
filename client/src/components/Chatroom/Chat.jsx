import { useEffect } from 'react';
import useAuth from '../../hooks/useAuth';

function Chat({ conversationMessages, currentConversationInfo, chatMessage, profilePictures }) {

    const DEFAULT_PICTURE = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
    const { user, userProfilePicture } = useAuth();

    useEffect(() => {
        if (chatMessage.current) {
            chatMessage.current.scrollIntoView();
        }
    }, [conversationMessages, currentConversationInfo.conversationID]);

    return (
        <div className='chatroom-chat'>
            {(conversationMessages[currentConversationInfo.conversationID] || []).map((message, index) => (
                <div key={index} ref={index === conversationMessages[currentConversationInfo.conversationID].length - 1 ? chatMessage : null} className={message.user === user ? 'chatroom-message-container client-con' : 'chatroom-message-container other-con'}>
                    <div className={message.user === user ? 'chatroom-message client' : 'chatroom-message other'}>
                        <div className='chatroom-message-username'>-{message.user}</div>
                        <div className='chatroom-message-text'>{message.message}</div>
                        <div className='chatroom-message-time'>{message.time}</div>
                    </div>
                    <img src={message.user === user ? userProfilePicture : profilePictures[message.user] || DEFAULT_PICTURE} className='chatroom-message-avatar' alt='avatar' />
                </div>
            ))}
        </div>
    )
};

export default Chat;