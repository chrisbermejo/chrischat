import ChatRoom from '../Chatroom/Chat'
import ChatRoomHeader from '../Chatroom/Header'
import FriendListHeader from '../Friend/FriendListHeader'
import ChatRoomInputBar from '../Chatroom/InputBar'
import FriendList from '../Friend/FriendList'

import useInfo from '../../hooks/useInfo';

function Body() {

    const { currentTab } = useInfo();

    return (
        <div className="body">
            {currentTab.type === 'friend' ? <FriendListHeader /> : <ChatRoomHeader currentTab={currentTab} />}
            {currentTab.type === 'chat' ? <ChatRoom /> : currentTab.type === 'friend' ? <FriendList /> : null}
            {currentTab.type === 'chat' ? <ChatRoomInputBar /> : null}
        </div>
    )
}

export default Body;