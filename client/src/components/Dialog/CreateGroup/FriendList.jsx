import useAuth from '../../../hooks/useAuth';
import './CreateGroup.css';

export default function FriendList({ filteredFriendList, setSelectedFriends, error, setError }) {
    const { user } = useAuth();

    const handleFriendSelection = (username) => {
        setSelectedFriends((prevSelectedFriends) =>
            prevSelectedFriends.includes(username)
                ? prevSelectedFriends.filter((friend) => friend !== username)
                : [...prevSelectedFriends, username]
        );
    };

    return (
        <>
            <label htmlFor='name' className={error.user ? 'error-text' : ''}>{error.userMessage}</label>
            <div className={error.user ? 'friend-list-selector error-input' : 'friend-list-selector'} onClick={() => {
                setError((prev) => ({ ...prev, user: false, userMessage: 'FRIENDS' }))
            }}>
                {filteredFriendList.map((friend, index) => (
                    <Friend key={index} friend={friend} user={user} handleFriendSelection={handleFriendSelection} />
                ))}
            </div>
        </>
    )
};

function Friend({ friend, user, handleFriendSelection }) {
    if (friend.receiver.username === user) {
        return <FriendFormat friend={friend.sender} handleFriendSelection={handleFriendSelection} />
    }
    else if (friend.sender.username === user) {
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