import useInfo from '../../../hooks/useInfo';
import useAuth from '../../../hooks/useAuth';

import ChangePassword from './ChangePassword';
import { useRef } from 'react';


export default function Dialog() {

    const { dialogRef } = useInfo();
    const { user, userProfilePicture } = useAuth();

    const changePasswordRef = useRef();

    return (
        <>
            <div className='setting-dialog-container'>
                <button className='setting-dialog-close-button-container' onClick={() => dialogRef.current.close()}>
                    <span>close</span>
                </button>
                <div className='setting-dialog'>
                    <img className='inner-setting-dialog-profile-picture' src={userProfilePicture} alt={user} height={100} />
                    <div className='inner-setting-dialog'>
                        <div className='inner-setting-dialog-user-info'>
                            <div className='inner-setting-dialog-item'>
                                <div className='inner-setting-dialog-item-title'>
                                    USERNAME
                                </div>
                                <div className='inner-setting-dialog-item-content'>
                                    <div>
                                        {user}
                                    </div>
                                    <button>Edit</button>
                                </div>
                            </div>
                            <div className='inner-setting-dialog-item'>
                                <div className='inner-setting-dialog-item-title'>
                                    GMAIL
                                </div>
                                <div className='inner-setting-dialog-item-content'>
                                    <div>
                                        *************@gmail.com
                                    </div>
                                    <button>Edit</button>
                                </div>
                            </div>
                            <div className='inner-setting-dialog-item'>
                                <div className='inner-setting-dialog-item-title'>
                                    PASSWORD
                                </div>
                                <div className='inner-setting-dialog-item-content'>
                                    <div>
                                        *************
                                    </div>
                                    <button>Edit</button>
                                </div>
                            </div>
                        </div>
                        <div className='inner-setting-dialog-buttons'>
                            {/* <button className='setting-dialog-button-password' onClick={() => changePasswordRef.current.showModal()}>
                                Change Password
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
            <ChangePassword changePasswordRef={changePasswordRef} />
        </>
    )
}

    // useEffect(() => {

    //     const handleDialog = () => {
    //         console.log('hello')
    //     }

    //     const dialogElement = dialogRef.current;

    //     if (dialogElement) {
    //         dialogElement.addEventListener('close', handleDialog);
    //     }

    //     return () => {
    //         if (dialogElement) {
    //             dialogElement.removeEventListener('close', handleDialog);
    //         }
    //     };
    // }, [dialogRef]);