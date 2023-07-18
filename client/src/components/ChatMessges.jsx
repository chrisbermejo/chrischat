import React from 'react';

const ChatMessages = ({ messages, chatMessageRef, user, userProfilePicture }) => {
    return (
        <>
            {messages.map((message, index) => (
                <div
                    key={index}
                    ref={chatMessageRef && index === messages.length - 1 ? chatMessageRef : null}
                    className={
                        message.user === user
                            ? 'chatroom-message-container client-con'
                            : 'chatroom-message-container other-con'
                    }
                >
                    <div
                        className={
                            message.user === user
                                ? 'chatroom-message client'
                                : 'chatroom-message other'
                        }
                    >
                        <div className='chatroom-message-username'>
                            <span>-</span>
                            {message.user === user ? user : message.user}
                        </div>
                        <div className='chatroom-message-text'>{message.message}</div>
                        <div className='chatroom-message-time'>{message.time}</div>
                    </div>
                    <img
                        src={
                            message.user === user
                                ? userProfilePicture
                                : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
                        }
                        className='chatroom-message-avatar'
                        alt='avatar'
                    />
                </div>
            ))}
        </>
    );
};

export default ChatMessages;
