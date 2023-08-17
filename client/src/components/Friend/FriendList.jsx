import useInfo from '../../hooks/useInfo';
import AddFriend from './AddFriend';

import FriendListMap from './FriendListMap';

function FriendList() {

    const { friendList, addFriendVisible, fetchingRoomAndFriendList } = useInfo();

    return (
        <div className='friend-tab'>
            {addFriendVisible && <AddFriend />}
            <div className='friend-list-header'>
                <div className='friend-list-search-bar-container'>
                    <div className='friend-list-search-bar-wrapper'>
                        <input className='friend-list-search-bar' type='text' placeholder='Search' />
                    </div>
                    <div className='material-symbols-outlined search-bar-icon'>search</div>
                </div>
            </div>
            <h5 className='friend-list-selection-header'>
                ALL FRIENDS - {
                    fetchingRoomAndFriendList.isLoading === true ?
                        ' ' :
                        fetchingRoomAndFriendList.isSuccess === true ?
                            friendList.length : 0
                }
            </h5>
            <FriendListMap />
            <div className='friend-list-footer'></div>
        </div>
    )
};

export default FriendList;