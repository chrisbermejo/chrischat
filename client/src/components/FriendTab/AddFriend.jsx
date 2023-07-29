import React, { useState, useEffect } from 'react';
import useInfo from '../../hooks/useInfo';

function AddFriend() {

    const [input, setInput] = useState('');

    const sendFriendRequest = async (username) => {
        try {
            const response = await fetch(`http://localhost:8000/addFriend/${username}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                console.log('ok')
            } else if (response.status === 401) {
                console.log('1');
            } else {
                console.log(`2`);
            }
        } catch (error) {
            console.error(`Error fetching user's room: ${error}`);
        }
    };

    return (
        <div className='add-friend'>
            <div className='add-friend-hgroup'>
                <h4 className='add-friend-header'>ADD FRIEND</h4>
                <h5 className='add-friend-subheader'>You can add friends with their username</h5>
            </div>
            <form className='add-friend-input-container'>
                <div className='add-friend-input-wrapper'>
                    <input
                        className='add-friend-input'
                        type='text'
                        placeholder='You can add friends with their username'
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>
                <button className='add-friend-button' type='submit' onClick={(e) => { e.preventDefault(); sendFriendRequest(input) }}>
                    <span className='add-friend-button-text'>
                        Send Friend Request
                    </span>
                </button>
            </form>
        </div>
    )
}

export default AddFriend;