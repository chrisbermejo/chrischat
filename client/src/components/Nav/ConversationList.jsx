import useInfo from '../../hooks/useInfo';
import useAuth from '../../hooks/useAuth';
import { GroupLayout, DmLayout } from './ConversationLayout';

function ConversationList() {

    const { fetchedConversations, currentTab, handleRoomClick, fetchingRoomAndFriendList } = useInfo();
    const { rowCount } = useAuth();

    if (fetchingRoomAndFriendList.isLoading) {
        const skeletonItems = Array.from({ length: (rowCount.ConversationCount || 0) }, (_, index) => (
            <div key={index} className='room skeleton-room'></div>
        ));

        return (
            <div className='rooms skeleton-rooms'>
                {skeletonItems}
            </div>
        );
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