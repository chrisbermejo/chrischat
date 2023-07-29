import useAuth from "../../hooks/useAuth"

export const GroupLayout = ({ conversation, currentTab, handleRoomClick }) => {
    return (
        <div className={`room ${currentTab.conversationID === conversation.room ? 'current-room' : ''}`} key={conversation.name} onClick={() => { handleRoomClick(conversation, conversation.picture, conversation.name) }}>
            <div className='conversation-picture-container'>
                <img className='conversation-picture' src={conversation.picture} alt="room-picture" />
            </div>
            <div className='room-information'>
                <div className='room-name'>{conversation.name}</div>
                <div className='room-user-count'>{conversation.users_count === 1 ? '1 Member' : `${conversation.users_count} Members`}</div>
            </div>
        </div>
    )
}

export const DmLayout = ({ conversation, currentTab, handleRoomClick }) => {

    const { user } = useAuth();
    const otherUser = conversation.users.find(e => e.username !== user);

    return (
        <div className={`room ${currentTab.conversationID === conversation.room ? 'current-room' : ''}`} key={conversation.name} onClick={() => { handleRoomClick(conversation, otherUser.picture, otherUser.username) }}>
            <div className='conversation-picture-container'>
                <img className='conversation-picture' src={otherUser.picture} alt="room-picture" />
            </div>
            <div className='room-information'>
                <div className='room-name'>{otherUser.username}</div>
            </div>
        </div>
    )
}