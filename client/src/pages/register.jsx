import React from 'react';
import { useNavigate } from 'react-router-dom';

function App() {

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedFormData = {
            username: e.target.username.value,
            email: e.target.email.value,
            password: e.target.password.value
        };

        try {
            const response = await fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedFormData)
            });

            if (response.ok) {
                navigate('/channel');
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
                    <h3 className='form-header'>Create an account</h3>
                </div>
                <form className='form' onSubmit={handleSubmit}>
                    <div className='form-input'>
                        <label htmlFor='username' >USERNAME</label>
                        <input type='text' name='username' required />
                    </div>
                    <div className='form-input'>
                        <label htmlFor='email' >EMAIL</label>
                        <input type='text' name='email' required />
                    </div>
                    <div className='form-input'>
                        <label htmlFor='password' >PASSWORD</label>
                        <input type='password' name='password' required />
                    </div>
                    <input className='form-button-submit' type='submit' value='Continue' />
                    <div className='form-resigter-container'>
                        <div className='form-resigter-text'>
                            <a href='/login' className='form-resigter-text-a'>Aready have an account?</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default App;
