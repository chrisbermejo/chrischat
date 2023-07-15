import React from 'react';

function App() {
    return (
        <div className='form-wrapper'>
            <div className='login-container'>
                <div className='login-header-container'>
                    <h2 className='login-header'>Welcome back!</h2>
                    <h4 className='login-subheader'>We're so excited to see you again!</h4>
                </div>
                <form className='login-form'>
                    <div className='login-form-input'>
                        <label for='email' >EMAIL <span className='required__star'>*</span></label>
                        <input type='email' name='email' required />
                    </div>
                    <div className='login-form-input'>
                        <label for='password' >PASSWORD <span className='required__star'>*</span></label>
                        <input type='password' name='password' required />
                    </div>
                    <input className='login-form-button-submit' type='submit' value='Login' />
                    <div className='login-form-resigter-container'>
                        <div className='login-form-resigter-text'>
                            <span className='login-form-resigter-text-span'>Need an account?</span>
                            <a href='#' className='login-form-resigter-text-a'>Register</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default App;
