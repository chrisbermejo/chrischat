import useInfo from '../../../hooks/useInfo';
import useAuth from '../../../hooks/useAuth';
import './CreateGroup.css';

export default function FriendList({ setSelectedFriends }) {

    const { friendList } = useInfo();
    const { user } = useAuth();

    const handleFriendSelection = (username) => {
        setSelectedFriends((prevSelectedFriends) =>
            prevSelectedFriends.includes(username)
                ? prevSelectedFriends.filter((friend) => friend !== username)
                : [...prevSelectedFriends, username]
        );
    };

    return (
        <div className='friend-list-selector'>
            {friendList.map((friend, index) => (
                <Friend key={index} friend={friend} user={user} handleFriendSelection={handleFriendSelection} />
            ))}
        </div>
    )
};

function Friend({ friend, user, handleFriendSelection }) {
    if (friend.receiver.username === user && friend.status === 'accepted') {
        return <FriendFormat friend={friend.sender} handleFriendSelection={handleFriendSelection} />
    }
    else if (friend.sender.username === user && friend.status === 'accepted') {
        return <FriendFormat friend={friend.receiver} handleFriendSelection={handleFriendSelection} />
    }
};

function FriendFormat({ friend, handleFriendSelection }) {
    return (
        <div className='friend-list-selector-item'>
            <input type="checkbox" value={friend.username} onChange={() => handleFriendSelection(friend.username)} />
            <img src={friend.picture} alt='friend-picture' width='40px' height='40px' className='friend-list-selector-item-picture' />
            <div className='friend-list-selector-item-name'>{friend.username}</div>
        </div>
    )
};