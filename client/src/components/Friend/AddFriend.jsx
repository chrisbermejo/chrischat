import React, { useState } from 'react';
import useSocket from '../../hooks/useSocket';
import useAuth from '../../hooks/useAuth';
import isAlphanumeric from 'validator/lib/isAlphanumeric';
import blacklist from 'validator/lib/blacklist';

function AddFriend() {

    const [input, setInput] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { socket } = useSocket();

    const sendFriendRequest = async (username) => {
        if ((!isAlphanumeric(username)) || username !== blacklist(username, '!@#$%^&*()')) {
            setErrorMessage('Username can only be alphanumeric');
            return false;
        }
        try {
            const response = await fetch(`http://localhost:8000/api/addFriend/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username })
            });
            if (response.ok) {
                const data = await response.json();
                socket.emit('sendFriendRequest', [data.request.sender.username, data.request.receiver.username], data.request);
                setErrorMessage('');
                setIsLoading(false);
                return;
            } else if (response.status === 401) {
                const data = await response.json();
                setErrorMessage(data.message);
                setIsLoading(false);
                return;
            } else {
                console.log(`Unable to send friend request`);
                setIsLoading(false);
                return;
            }
        } catch (error) {
            console.error(`Error fetching user's room: ${error}`);
        }
    };

    const handleSendFriendRequest = async (e) => {
        setIsLoading(true);
        e.preventDefault();
        if (input.toLowerCase() !== user) {
            await sendFriendRequest(input.toLowerCase())
        } else {
            setErrorMessage('You cannot send a friend request to yourself');
        }
    };

    return (
        <div className='add-friend'>
            <div className='add-friend-hgroup'>
                <h4 className='add-friend-header'>ADD FRIEND</h4>
                <h5 className='add-friend-subheader'>You can add friends with their username</h5>
            </div>
            <form className={errorMessage.length ? 'add-friend-input-container add-friend-input-container-error' : input.length ? 'add-friend-input-container add-friend-input-container-active' : 'add-friend-input-container'}>
                <div className='add-friend-input-wrapper'>
                    <input
                        className='add-friend-input'
                        type='text'
                        placeholder='You can add friends with their username'
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setErrorMessage('');
                        }}
                    />
                </div>
                <button className='add-friend-button' type='submit' disabled={isLoading} onClick={(e) => { handleSendFriendRequest(e) }}>
                    <span className='add-friend-button-text'>
                        Send Friend Request
                    </span>
                </button>
            </form>
            <div className='add-friend-error-message'>{errorMessage}</div>
        </div>
    )
}

export default AddFriend;