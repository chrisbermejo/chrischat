import useAuth from '../../hooks/useAuth';
import useInfo from '../../hooks/useInfo';
import useSocket from '../../hooks/useSocket';
import FriendFormat from '../Friend/FriendFormat';

import { useEffect } from 'react';

function FriendListMap() {

    const { socket } = useSocket();
    const { friendList, fetchingRoomAndFriendList, filter, filterFriendList, setFilterFriendList } = useInfo();
    const { user, rowCount } = useAuth();

    useEffect(() => {
        if (!fetchingRoomAndFriendList.isLoading && filter === 'all') {
            setFilterFriendList(friendList);
        } else if (!fetchingRoomAndFriendList.isLoading && filter === 'online') {
            setFilterFriendList(friendList.filter((friend) => (friend.receiver.online || friend.sender.online) && friend.status === 'accepted'));
        } else if (!fetchingRoomAndFriendList.isLoading && filter === 'pending') {
            setFilterFriendList(friendList.filter(friend => friend.status === 'pending'));
        }
    }, [!fetchingRoomAndFriendList.isLoading, filter, friendList])

    if (fetchingRoomAndFriendList.isLoading && !filterFriendList) {

        const skeletonItems = Array.from({ length: (rowCount.FriendListCount || 0) }, (_, index) => (
            <div key={index} className='friend-list-item skeleton-friend-list-item'>
                <div className='skeleton-box'></div>
            </div>
        ));

        return (
            <div className='friend-list-item-container skeleton-friend-list-item-container'>
                {skeletonItems}
            </div>
        );
    }

    return (

        <div className='friend-list-item-container'>
            {(filterFriendList || []).map((friend, index) => (
                <FriendFormat key={index} friend={friend} user={user} socket={socket} />
            ))}
        </div>
    )
};

export default FriendListMap;