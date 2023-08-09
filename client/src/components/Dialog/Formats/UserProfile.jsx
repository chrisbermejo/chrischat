import useAuth from '../../../hooks/useAuth';

import './UserProfile.css';

export default function UserProfile({ dialogRef }) {
    const { user, userProfilePicture } = useAuth();

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
                    <div>
                        <h6>USERNAME</h6>
                        <h3>{user}</h3>
                    </div>
                    <div>
                        <h6>EMAIL</h6>
                        <div>ch******@gmail.com</div>
                    </div>
                    <div>
                        <h6>PASSWORD</h6>
                        <div>********</div>
                    </div>
                </div>
            </div>
        </div>
    )
}