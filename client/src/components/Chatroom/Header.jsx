import React from 'react';

import useInfo from '../../hooks/useInfo'

function Chatroom() {

    const { currentConversationInfo } = useInfo();

    return (
        <div className='chatroom-title-container-container'>
            <div className='chatroom-title-container'>
                {currentConversationInfo.conversationPicture !== null ? <img className='chatroom-title-picture' height={40} width={40} src={currentConversationInfo.conversationPicture} alt='conversation-picture' /> : null}
                <h2 className='chatroom-title'>{currentConversationInfo.conversationName}</h2>
            </div>
        </div>
    );
}

export default Chatroom;