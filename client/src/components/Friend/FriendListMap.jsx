import useAuth from '../../hooks/useAuth';
import useInfo from '../../hooks/useInfo';
import useSocket from '../../hooks/useSocket';
import FriendFormat from '../Friend/FriendFormat';

function FriendList() {

    const { socket } = useSocket();
    const { friendList, fetchingRoomAndFriendList } = useInfo();
    const { user, rowCount } = useAuth();

    if (fetchingRoomAndFriendList.isLoading) {

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
            {friendList.map((friend, index) => (
                <FriendFormat key={index} friend={friend} user={user} socket={socket} />
            ))}
        </div>
    )
};

export default FriendList;