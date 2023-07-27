import useAuth from "../../hooks/useAuth"

export const GroupLayout = ({ conversation, currentConversationInfo, handleRoomClick }) => {
    return (
        <div className={`room ${currentConversationInfo.conversationID === conversation.room ? 'current-room' : ''}`} key={conversation.name} onClick={() => { handleRoomClick(conversation, conversation.picture, conversation.name) }}>
            <div className='room-picture-container'>
                <img className='room-picture' height={35} width={35} src={conversation.picture} alt="room-picture" />
            </div>
            <div className='room-information'>
                <div className='room-name'>{conversation.name}</div>
                <div className='room-user-count'>{conversation.users_count === 1 ? '1 Member' : `${conversation.users_count} Members`}</div>
            </div>
        </div>
    )
}

export const DmLayout = ({ conversation, currentConversationInfo, handleRoomClick }) => {

    const { user } = useAuth();
    const otherUser = conversation.users.find(e => e.username !== user);

    return (
        <div className={`room ${currentConversationInfo.conversationID === conversation.room ? 'current-room' : ''}`} key={conversation.name} onClick={() => { handleRoomClick(conversation, otherUser.picture, otherUser.username) }}>
            <div className='room-picture-container'>
                <img className='room-picture' height={35} width={35} src={otherUser.picture} alt="room-picture" />
            </div>
            <div className='room-information'>
                <div className='room-name'>{otherUser.username}</div>
            </div>
        </div>
    )
}