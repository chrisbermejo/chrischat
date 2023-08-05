import React from 'react';

function ChatRoomHeader({ currentTab }) {
    return (
        <div className='chatroom-title-container-container'>
            <div className='chatroom-title-container'>
                <img className='chatroom-title-picture' height={40} width={40} src={currentTab.conversationPicture} alt='conversation-picture' />
                <h3 className='chatroom-title'>{currentTab.conversationName}</h3>
            </div >
        </div>
    )
}

export default ChatRoomHeader;