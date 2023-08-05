import React, { useState, useEffect } from 'react';
import useInfo from '../../hooks/useInfo';
import useSocket from '../../hooks/useSocket';
import useAuth from '../../hooks/useAuth';

function AddFriend() {

    const [input, setInput] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { user } = useAuth();
    const { socket } = useSocket();

    const sendFriendRequest = async (username) => {
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
            } else if (response.status === 401) {
                const data = await response.json();
                setErrorMessage(data.message);
            } else {
                console.log(`Unable to send friend request`);
            }
        } catch (error) {
            console.error(`Error fetching user's room: ${error}`);
        }
    };

    const handleSendFriendRequest = (e) => {
        e.preventDefault();
        if (input.toLowerCase() !== user) {
            sendFriendRequest(input.toLowerCase())
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
                <button className='add-friend-button' type='submit' onClick={(e) => { handleSendFriendRequest(e) }}>
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