import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import useAuth from '../../hooks/useAuth';

import isAlphanumeric from 'validator/lib/isAlphanumeric';
import isEmail from 'validator/lib/isEmail';

function Register() {

    const { setSocket } = useSocket();
    const { setUser, setUserProfilePicture, setIsAuthenticated, setUserEmail } = useAuth();
    const [error, setError] = useState({
        username: false,
        usernameMessage: 'USERNAME',
        email: false,
        emailMessage: 'EMAIL',
        password: false,
        passwordMessage: 'PASSWORD'
    });
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const passwordTest = (e) => {
        let validated = false
        if (e.value.length < 8) {
            validated = true;
        }
        if (!/\d/.test(e.value)) {
            validated = true;
        }
        if (!/[a-z]/.test(e.value)) {
            validated = true;
        }
        if (!/[A-Z]/.test(e.value)) {
            validated = true;
        }
        if (!/[^0-9a-zA-Z]/.test(e.value)) {
            validated = true;
        }
        return validated;
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!e.target.username.value) {
            setError((prevState) => ({ ...prevState, username: true, usernameMessage: 'USERNAME - Username is required' }));
            setIsLoading(false);
            return;
        }
        if (!isAlphanumeric(e.target.username.value)) {
            setError((prevState) => ({ ...prevState, username: true, usernameMessage: 'USERNAME - No special characters' }));
            setIsLoading(false);
            return;
        }
        if (e.target.username.value.length < 4 || e.target.username.value.length > 20) {
            setError((prevState) => ({ ...prevState, username: true, usernameMessage: 'USERNAME - Must be between 4 and 20 characters' }));
            setIsLoading(false);
            return;
        }
        if (!e.target.email.value) {
            setError((prevState) => ({ ...prevState, email: true, emailMessage: 'EMAIL - Email is required' }));
            setIsLoading(false);
            return;
        }
        if (!isEmail(e.target.email.value)) {
            setError((prevState) => ({ ...prevState, email: true, emailMessage: 'EMAIL - Invalid email' }));
            setIsLoading(false);
            return;
        }
        if (!e.target.password.value) {
            setError((prevState) => ({ ...prevState, password: true, passwordMessage: 'PASSWORD - Password is required' }));
            setIsLoading(false);
            return;
        }
        if (passwordTest(e.target.password)) {
            setError((prevState) => ({ ...prevState, password: true, passwordMessage: 'PASSWORD - Must be at least 8 characters, including at least one letter, one number and one special character' }));
            setIsLoading(false);
            return;
        }

        const updatedFormData = {
            username: e.target.username.value,
            email: e.target.email.value,
            password: e.target.password.value
        };

        try {
            const response = await fetch('http://localhost:8000/register', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedFormData)
            });

            if (response.ok) {
                setSocket(null);
                const data = await response.json();
                setUser(data.username);
                setUserProfilePicture(data.picture);
                setUserEmail(data.email);
                setIsAuthenticated(true);
                setIsLoading(false);
                navigate('/channel');
            } else if (response.status === 409) {
                const data = await response.json();
                setError(data);
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
                    <h3 className='form-header'>Create an account</h3>
                </div>
                <form className='form' onSubmit={handleSubmit}>
                    <div className='form-input'>
                        <label htmlFor='username' className={error.username ? 'error-text' : ''} >{error.usernameMessage}</label>
                        <input type='text' onClick={
                            () => { setError((prevState) => ({ ...prevState, username: false, usernameMessage: 'USERNAME' })); }
                        } name='username' className={error.username ? 'error-input' : ''} />
                    </div>
                    <div className='form-input'>
                        <label htmlFor='email' className={error.email ? 'error-text' : ''}>{error.emailMessage}</label>
                        <input type='text' name='email' onClick={
                            () => { setError((prevState) => ({ ...prevState, email: false, emailMessage: 'EMAIL' })); }
                        } className={error.email ? 'error-input' : ''} />
                    </div>
                    <div className='form-input'>
                        <label htmlFor='password' className={error.password ? 'error-text' : ''}>{error.passwordMessage}</label>
                        <input type='password' name='password' onClick={
                            () => {
                                setError((prevState) => ({
                                    ...prevState, password: false, passwordMessage: 'PASSWORD'
                                }));
                            }
                        } className={error.password ? 'error-input' : ''} />
                    </div>
                    <input className='form-button-submit' type='submit' value='Continue' disabled={isLoading} />
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

export default Register;
