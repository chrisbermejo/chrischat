import React from 'react';

function App() {
    return (
        <div className='form-wrapper'>
            <div className='form-container'>
                <div className='form-header-container'>
                    <h2 className='form-header'>Welcome back!</h2>
                    <h4 className='form-subheader'>We're so excited to see you again!</h4>
                </div>
                <form className='form'>
                    <div className='form-input'>
                        <label for='email' >EMAIL <span className='required__star'>*</span></label>
                        <input type='email' name='email' required />
                    </div>
                    <div className='form-input'>
                        <label for='password' >PASSWORD <span className='required__star'>*</span></label>
                        <input type='password' name='password' required />
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

export default App;
