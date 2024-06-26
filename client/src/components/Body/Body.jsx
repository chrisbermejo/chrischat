import ChatRoom from '../Chatroom/Chat'
import ChatRoomHeader from '../Chatroom/Header'
import FriendListHeader from '../Friend/FriendListHeader'
import { ChatRoomInputBar, AddFriend } from '../Chatroom/InputBar'
import FriendList from '../Friend/FriendList'

import useInfo from '../../hooks/useInfo';

function Body() {

    const { currentTab, friendList } = useInfo();

    const handleInputVisiblity = () => {
        const boolean = (friendList.some(friend =>
            friend.receiver.username === currentTab.conversationName && friend.status === 'accepted'
            || friend.sender.username === currentTab.conversationName && friend.status === 'accepted'))
        return boolean;
    }

    return (
        <div className="body">
            {currentTab.type === 'group' || currentTab.type === 'private'
                ? <ChatRoomHeader currentTab={currentTab} />
                : currentTab.type === 'friend'
                    ? <FriendListHeader />
                    : null
            }
            {currentTab.type === 'group' || currentTab.type === 'private'
                ? <ChatRoom />
                : currentTab.type === 'friend'
                    ? <FriendList />
                    : null
            }
            {currentTab.type === 'group'
                ? <ChatRoomInputBar />
                : currentTab.type === 'private' && handleInputVisiblity()
                    ? <ChatRoomInputBar />
                    : currentTab.type === 'friend' ? null : <AddFriend />
            }
        </div>
    )
}

export default Body;