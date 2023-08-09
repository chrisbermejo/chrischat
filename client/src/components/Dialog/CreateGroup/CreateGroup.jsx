import useAuth from '../../../hooks/useAuth';
import useSocket from '../../../hooks/useSocket';

import './CreateGroup.css';
import FriendList from './FriendList';
import { useState } from 'react';

export default function CreateGroup() {

    const [selectedFriends, setSelectedFriends] = useState([]);
    const { user } = useAuth();
    const { socket } = useSocket();

    const handleSubmit = async (e, selectedFriends) => {
        e.preventDefault();

        const updatedFormData = {
            name: e.target.name.value,
            users: [user, ...selectedFriends],
        };
        if (updatedFormData.name.length < 0) {
            console.log('Please enter a group name');
        }
        else if (updatedFormData.users.length <= 2) {
            console.log('Please select at least 2 users');
        } else {
            try {
                const response = await fetch('http://localhost:8000/createConversation', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedFormData)
                });

                if (response.ok) {
                    const data = await response.json();
                    socket.emit('sendConversation', updatedFormData.users, data);
                } else {
                    console.log('failed');
                }
            } catch (error) {
                console.log(error);
            }
        }
    };


    return (
        <div className='create-group-form-wrapper'>
            <div className='create-group-header'>
                <h2>Create your group</h2>
            </div>
            <div className='create-group-form-container'>
                <form className='create-group-form' onSubmit={(e) => handleSubmit(e, selectedFriends)}>
                    <div className='create-group-form-input'>
                        <label htmlFor='name' >GROUP NAME</label>
                        <input type='text' name='name' required />
                    </div>
                    <FriendList setSelectedFriends={setSelectedFriends} />
                    <input className='form-button-submit' type='submit' value='Create' />
                </form>
            </div>
        </div>
    )
}