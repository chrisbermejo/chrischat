export const GroupLayout = ({ conversation, currentTab, handleRoomClick }) => {
    return (
        <div className={`room ${currentTab.conversationID === conversation.chatid ? 'current-room' : ''}`} key={conversation.group_name} onClick={() => { handleRoomClick(conversation) }}>
            <div className='conversation-picture-container'>
                <img className='conversation-picture' src={conversation.chat_picture} alt="room-picture" />
            </div>
            <div className='room-information'>
                <div className='room-name'>{conversation.chat_name}</div>
                <div className='room-user-count'>{conversation.participants_count === 1 ? '1 Member' : `${conversation.participants_count} Members`}</div>
            </div>
        </div>
    )
};

export const DmLayout = ({ conversation, currentTab, handleRoomClick }) => {
    return (
        <div className={`room ${currentTab.conversationID === conversation.chatid ? 'current-room' : ''}`} key={conversation.name} onClick={() => { handleRoomClick(conversation) }}>
            <div className='conversation-picture-container'>
                <img className='conversation-picture' src={conversation.chat_picture} alt="room-picture" />
            </div>
            <div className='room-information'>
                <div className='room-name'>{conversation.chat_name}</div>
            </div>
        </div>
    )
};