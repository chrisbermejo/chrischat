import React, { useState } from 'react';

function App() {

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormData({
      email: e.target.email.value,
      password: e.target.password.value  
    });

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if(response.ok) {
        console.log('success');
      } else {
        console.log('error');
      }
    } catch (error) {
      console.log(error);
    }

  }
    return (
        <div className='form-wrapper'>
            <div className='form-container'>
                <div className='form-header-container'>
                    <h3 className='form-header'>Create an account</h3>
                </div>
                <form className='form' onSubmit={handleSubmit}>
                    <div className='form-input'>
                        <label for='email' >EMAIL</label>
                        <input type='email' name='email' required />
                    </div>
                    <div className='form-input'>
                        <label for='password' >PASSWORD</label>
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
