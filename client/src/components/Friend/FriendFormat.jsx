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
                socket.emit('sendAcceptRequest', [friend.receiver.username, friend.sender.username], users, [data.forReceiver, data.forSender])
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
        return <Friend friend={friend.sender} />
    }
    else if (friend.sender.username === user && friend.status === 'accepted') {
        return <Friend friend={friend.receiver} />
    }
};