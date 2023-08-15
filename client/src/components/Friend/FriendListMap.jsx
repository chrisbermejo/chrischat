import useAuth from '../../hooks/useAuth';
import useInfo from '../../hooks/useInfo';
import useSocket from '../../hooks/useSocket';
import FriendFormat from '../Friend/FriendFormat';

function FriendList() {

    const { socket } = useSocket();
    const { friendList, fetchingRoomAndFriendList } = useInfo();
    const { user } = useAuth();

    if (fetchingRoomAndFriendList.isLoading) {
        return (
            <div className='friend-list-item-container skeleton-friend-list-item-container'>
                <div className='friend-list-item skeleton-friend-list-item'>
                    <div className='skeleton-box'></div>
                </div>
                <div className='friend-list-item skeleton-friend-list-item'>
                    <div className='skeleton-box'></div>
                </div>
                <div className='friend-list-item skeleton-friend-list-item'>
                    <div className='skeleton-box'></div>
                </div>
                <div className='friend-list-item skeleton-friend-list-item'>
                    <div className='skeleton-box'></div>
                </div>
                <div className='friend-list-item skeleton-friend-list-item'>
                    <div className='skeleton-box'></div>
                </div>
                <div className='friend-list-item skeleton-friend-list-item'>
                    <div className='skeleton-box'></div>
                </div>
                <div className='friend-list-item skeleton-friend-list-item'>
                    <div className='skeleton-box'></div>
                </div>
            </div>
        )
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