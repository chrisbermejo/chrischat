import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';

function Room() {

    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedFormData = {
            name: e.target.name.value,
            users: [user, 'joe']
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
                console.log('passed');
            } else {
                console.log('failed');
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className='form-wrapper'>
            <div className='form-container'>
                <div className='form-header-container'>
                    <h2 className='form-header'>Create Room</h2>
                </div>
                <form className='form' onSubmit={handleSubmit}>
                    <div className='form-input'>
                        <label htmlFor='name' >NAME</label>
                        <input type='text' name='name' required />
                    </div>
                    {/* <div className='form-input'>
                        <label htmlFor='id' >ID <span className='required__star'>*</span></label>
                        <input type='text' name='id' required />
                    </div> */}
                    <input className='form-button-submit' type='submit' value='Login' />
                </form>
            </div>
        </div>
    );
}

export default Room;
