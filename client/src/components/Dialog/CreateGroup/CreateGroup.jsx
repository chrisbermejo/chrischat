import useAuth from '../../../hooks/useAuth';
import useSocket from '../../../hooks/useSocket';
import useInfo from '../../../hooks/useInfo';

import isAlphanumeric from 'validator/lib/isAlphanumeric';

import './CreateGroup.css';
import FriendList from './FriendList';
import { useState, useRef, useEffect } from 'react';

export default function CreateGroup({ dialogRef }) {

    const [selectedFriends, setSelectedFriends] = useState([]);
    const [filteredFriendList, setFilteredFriendList] = useState([]);
    const [error, setError] = useState({
        name: false,
        nameMessage: 'GROUP NAME',
        user: false,
        userMessage: 'FRIENDS',
    });
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useAuth();
    const { socket } = useSocket();
    const { friendList, setDialogType } = useInfo();

    const formRef = useRef(null);
    const handleSubmit = async (e, selectedFriends) => {
        e.preventDefault();
        setIsLoading(true);

        if (!e.target.name.value) {
            setError((prevState) => ({ ...prevState, name: true, nameMessage: 'GROUP NAME - Enter a group name' }));
            setIsLoading(false);
            return;
        }

        if (!isAlphanumeric(e.target.name.value)) {
            setError((prevState) => ({ ...prevState, name: true, nameMessage: 'GROUP NAME - Enter a valid group name' }));
            setIsLoading(false);
            return;
        }

        if (e.target.name.value.length < 1 || e.target.name.value.length > 30) {
            setError((prevState) => ({ ...prevState, name: true, nameMessage: 'GROUP NAME - Group name too long' }));
            setIsLoading(false);
            return;
        }

        if (selectedFriends.length < 2) {
            setError((prevState) => ({ ...prevState, user: true, userMessage: 'FRIENDS - Need at least 2 friends' }));
            setIsLoading(false);
            return;
        }

        const updatedFormData = {
            name: e.target.name.value,
            users: [user, ...selectedFriends],
        };

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
                formRef.current.reset();
                const data = await response.json();
                socket.emit('sendConversation', updatedFormData.users, data);
                setDialogType('NONE');
                setIsLoading(false);
                dialogRef.current.close();
            } else if (response.status === 409) {
                const data = await response.json();
                if (data.name) {
                    setError((prevState) => ({
                        ...prevState,
                        name: true,
                        nameMessage: 'GROUP NAME - Enter valid group name'
                    }));
                }
                if (data.users) { 
                    setError((prevState) => ({
                        ...prevState,
                        user: true,
                        userMessage: 'GROUP PARTICIPANTS - Enter at least 2 participants'
                    }));
                }
                setIsLoading(false);
                return;
            }
            else {
                console.log('Something went wrong');
                setIsLoading(false);
                return;
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        formRef.current.reset();
        setIsLoading(false);
        setSelectedFriends([]);
        setError({
            name: false,
            nameMessage: 'GROUP NAME',
            user: false,
            userMessage: 'FRIENDS',
        });
        setFilteredFriendList(friendList.filter((friend) => friend.status === 'accepted'));
    }, []);

    return (
        <div className='create-group-form-wrapper'>
            <div className='create-group-header'>
                <h2>Create your group</h2>
            </div>
            <div className='create-group-form-container'>
                <form className='create-group-form' onSubmit={(e) => handleSubmit(e, selectedFriends)} ref={formRef}>
                    <div className='create-group-form-input'>
                        <label htmlFor='name' className={error.name ? 'error-text' : ''}>{error.nameMessage}</label>
                        <input type='text' name='name' onClick={
                            () => {
                                setError((prevState) => ({
                                    ...prevState, name: false, nameMessage: 'GROUP NAME'
                                }));
                            }
                        } className={error.name ? 'error-input' : ''} />
                    </div>
                    {filteredFriendList.length > 1
                        ? <FriendList filteredFriendList={filteredFriendList} setSelectedFriends={setSelectedFriends} error={error} setError={setError} />
                        :
                        <div className='no-friends-condition-div'>
                            Need at least 2 friends to create a group!
                        </div>
                    }
                    <input className=' create-group-button' type='submit' value='Create' disabled={filteredFriendList.length < 2 || isLoading} />
                </form>
            </div>
        </div>
    )
}