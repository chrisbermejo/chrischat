import './Logout.css'
import useAuth from '../../../hooks/useAuth';

export default function Logout({ dialogRef }) {

    const { logout } = useAuth();

    return (
        <div className='logout-container'>
            <div className='logout-text'>
                <h3 className='logout-text-title'>Log out</h3>
                <div className='logout-text-desc'>Are you sure you want to logout?</div>
            </div>
            <div className='logout-buttons'>
                <button className='logout-button logout-button-cancel' onClick={() => { dialogRef.current.close() }}>Cancel</button>
                <button className='logout-button logout-button-logout' onClick={logout}>Log Out</button>
            </div>
        </div>
    )
}