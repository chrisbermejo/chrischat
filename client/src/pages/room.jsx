import React from 'react';

function Room() {

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedFormData = {
            name: e.target.name.value,
            id: e.target.id.value,
            user: [{user: 'joe', pfp: 'https://cdn.discordapp.com/avatars/205457610105683969/a0874d497a37fbb0d8f4aab1498aff14.webp'}, {user: 'nyex', pfp: 'https://cdn.discordapp.com/avatars/205457610105683969/a0874d497a37fbb0d8f4aab1498aff14.webp'}]
        };

        try {
            const response = await fetch('http://localhost:4000/createRoom', {
                method: 'POST',
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
                    <div className='form-input'>
                        <label htmlFor='id' >ID <span className='required__star'>*</span></label>
                        <input type='text' name='id' required />
                    </div>
                    <input className='form-button-submit' type='submit' value='Login' />
                </form>
            </div>
        </div>
    );
}

export default Room;
