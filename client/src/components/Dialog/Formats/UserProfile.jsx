import { useEffect, useState } from 'react';
import useAuth from '../../../hooks/useAuth';

import './UserProfile.css';

export default function UserProfile() {
    const { user, userProfilePicture, userEmail } = useAuth();

    const [email, setEmail] = useState('');
    const [buttonText, setButtonText] = useState('Reveal');

    const handleShowEmail = () => {
        if (email === userEmail) {
            setEmail(emailHidden());
            setButtonText('Reveal');
        } else {
            setEmail(userEmail);
            setButtonText('Hide');
        }
    }


    const emailHidden = () => {
        const parts = userEmail.split('@');
        const domain = '@' + parts[1];
        const hiddenUsername = '*'.repeat(parts[0].length);
        return hiddenUsername + domain;
    }

    useEffect(() => {
        setEmail(emailHidden());
    }, [])

    return (
        <div className='settings-container'>
            <div className='banner'>
                <div className='rec'></div>
                <div className='circle'></div>
            </div>
            <img className='profile-picture' src={userProfilePicture} alt="user profile picture" height={120} width={120} />
            <button className='user-profile-button'>Edit User Profile</button>
            <div className='settings-content-container'>
                <div className='settings-content'>
                    <div className='setting-user-info-container'>
                        <h6 className='setting-user-info-header username'>USERNAME</h6>
                        <h3 className='setting-user-info-text username'>{user}</h3>
                    </div>
                    <div className='setting-user-info-container'>
                        <h6 className='setting-user-info-header email'>EMAIL</h6>
                        <div className='setting-user-inf-text-email-container'>
                            <div className='setting-user-info-text email'>{email || 'loading...'}</div>
                            <button className='button-email-reveal' onClick={handleShowEmail}>
                                <span>{buttonText}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}