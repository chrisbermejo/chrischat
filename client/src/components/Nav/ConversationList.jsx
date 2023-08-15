import useInfo from '../../hooks/useInfo';
import { GroupLayout, DmLayout } from './ConversationLayout';

function ConversationList() {

    const { fetchedConversations, currentTab, handleRoomClick, fetchingRoomAndFriendList } = useInfo();

    if (fetchingRoomAndFriendList.isLoading) {
        return (
            <div className='rooms skeleton-rooms'>
                <div className='room skeleton-room'></div>
                <div className='room skeleton-room'></div>
                <div className='room skeleton-room'></div>
                <div className='room skeleton-room'></div>
                <div className='room skeleton-room'></div>
                <div className='room skeleton-room'></div>
                <div className='room skeleton-room'></div>
                <div className='room skeleton-room'></div>
            </div >
        )
    };

    return (
        <div className='rooms'>
            {fetchedConversations.map((conversation, index) => (
                conversation.type === "group"
                    ? <GroupLayout key={`Conversation${index}`} conversation={conversation} currentTab={currentTab} handleRoomClick={handleRoomClick} />
                    : <DmLayout key={`Conversation${index}`} conversation={conversation} currentTab={currentTab} handleRoomClick={handleRoomClick} />
            ))}
        </div>
    )
};

export default ConversationList;