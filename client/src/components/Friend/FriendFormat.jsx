import { IncomingFriendRequest, Friend, OutgoingFriendRequest } from '../Friend/Formats';

export default function FriendFormat({ friend, user, socket }) {

    const handleDecline = async (e, users) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/deleteRequest`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(users),
            });
            if (response.ok) {
                socket.emit('sendDelcineRequest', [friend.receiver.username, friend.sender.username], users)
            } else {
                console.log(`Failed to delete friend request`);
            }
        } catch (error) {
            console.error(`Error fetching user's room: ${error}`);
        }
    };

    const handleAccept = async (e, users) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/acceptRequest`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(users),
            });
            if (response.ok) {
                const data = await response.json();
                console.log('accept', friend)
                socket.emit('sendAcceptRequest', data.newChat,
                    [friend.receiver.username, friend.sender.username],
                    users,
                    [data.forReceiver, data.forSender],
                    [data.senderOnline, data.receiverOnline]
                )
            } else {
                console.log(`Failed to accept friend request`);
            }
        } catch (error) {
            console.error(`Error accepting friend request: ${error}`);
        }
    };

    const handleRemoveFriend = async (e, users) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/removeFriend`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(users),
            });
            if (response.ok) {
                socket.emit('sendRemoveFriend', [friend.receiver.username, friend.sender.username], users)
            } else {
                console.log(`Failed to accept friend request`);
            }
        } catch (error) {
            console.error(`Error accepting friend request: ${error}`);
        }
    };

    if (friend.receiver.username === user && friend.status === 'pending') {
        return <IncomingFriendRequest friend={friend} onDecline={handleDecline} onAccept={handleAccept} />
    }
    else if (friend.sender.username === user && friend.status === 'pending') {
        return <OutgoingFriendRequest friend={friend} onDecline={handleDecline} />
    }
    else if (friend.receiver.username === user && friend.status === 'accepted') {
        return <Friend type={'sender'} friendInfo={friend} onRemoveFriend={handleRemoveFriend} />
    }
    else if (friend.sender.username === user && friend.status === 'accepted') {
        return <Friend type={'receiver'} friendInfo={friend} onRemoveFriend={handleRemoveFriend} />
    }
};