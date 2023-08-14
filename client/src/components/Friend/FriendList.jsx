import useAuth from '../../hooks/useAuth';
import useInfo from '../../hooks/useInfo';
import useSocket from '../../hooks/useSocket';
import AddFriend from './AddFriend';
import FriendFormat from '../Friend/FriendFormat';

function FriendList() {

    const { socket } = useSocket();
    const { friendList, addFriendVisible } = useInfo();
    const { user } = useAuth();

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
            <h5 className='friend-list-selection-header'>ALL FRIENDS - {friendList.length}</h5>
            <div className='friend-list-item-container'>
                {friendList.map((friend, index) => (
                    <FriendFormat key={index} friend={friend} user={user} socket={socket} />
                ))}
            </div>
            <div className='friend-list-footer'></div>
        </div>
    )
};

export default FriendList;