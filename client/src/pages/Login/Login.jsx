import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import useAuth from '../../hooks/useAuth';
import isAlphanumeric from 'validator/lib/isAlphanumeric';

function Login() {

    const { setSocket } = useSocket();
    const { setUser, setUserProfilePicture, setIsAuthenticated, setUserEmail, setRowCount } = useAuth();
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const passwordTest = (e) => {
        let validated = false
        if (e.value.length < 8) {
            console.log('Password must be at least 8 characters long');
            validated = true;
        }
        if (!/\d/.test(e.value)) {
            console.log('Password must contain at least one number');
            validated = true;
        }
        if (!/[a-z]/.test(e.value)) {
            console.log('Password must contain at least one lowercase letter');

            validated = true;
        }
        if (!/[A-Z]/.test(e.value)) {
            console.log('Password must contain at least one uppercase letter');

            validated = true;
        }
        if (!/[^0-9a-zA-Z]/.test(e.value)) {
            console.log('Password must contain at least one special character');
            validated = true;
        }
        return validated;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!e.target.username.value
            || !e.target.password.value
            || !isAlphanumeric(e.target.username.value)
            || (e.target.username.value.length < 4 || e.target.username.value.length > 20)
            || (e.target.password.value.length < 8)
            || passwordTest(e.target.password)
        ) {
            setError(true);
            setIsLoading(false);
            return;
        }

        const updatedFormData = {
            username: e.target.username.value,
            password: e.target.password.value
        };

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedFormData)
            });
            if (response.ok) {
                setError(false);
                setSocket(null);
                const data = await response.json();
                setUser(data.username);
                setUserProfilePicture(data.picture);
                setUserEmail(data.email);
                setRowCount({
                    FriendListCount: data.FriendListCount,
                    ConversationCount: data.ConversationCount
                });
                setIsAuthenticated(true);
                setIsLoading(false);
                navigate('/channel');
            } else if (response.status === 401) {
                setError(true);
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            } else {
                setSocket(null);
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
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
                    {error && <h3 className='error-text-login'>Invalid username or password</h3>}
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
                    <input className='form-button-submit' type='submit' value='Login' disabled={isLoading} />
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
