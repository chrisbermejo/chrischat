import React from 'react';
import { createSocket } from '../socket';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';

function Login() {

    const { setSocket, setSocketID } = useSocket();
    const { login } = useAuth();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedFormData = {
            username: e.target.username.value,
            password: e.target.password.value
        };

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedFormData)
            });

            if (response.ok) {
                const token = await response.json();
                login(token.token);
                const socket = createSocket(token.token);
                socket.on('connect', () => {
                    setSocket(socket);
                    setSocketID(socket.id);
                });
                if (socket && token.token) {
                    navigate('/channel');
                }
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
                    <h2 className='form-header'>Welcome back!</h2>
                    <h4 className='form-subheader'>We're so excited to see you again!</h4>
                </div>
                <form className='form' onSubmit={handleSubmit}>
                    <div className='form-input'>
                        <label htmlFor='username' >USERNAME</label>
                        <input type='text' name='username' required autoComplete="on" />
                    </div>
                    <div className='form-input'>
                        <label htmlFor='password' >PASSWORD <span className='required__star'>*</span></label>
                        <input type='password' name='password' required autoComplete="on" />
                    </div>
                    <input className='form-button-submit' type='submit' value='Login' />
                    <div className='form-resigter-container'>
                        <div className='form-resigter-text'>
                            <span className='form-resigter-text-span'>Need an account?</span>
                            <a href='/register' className='form-resigter-text-a'>Register</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
