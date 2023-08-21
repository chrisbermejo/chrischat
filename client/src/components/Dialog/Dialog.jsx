import useInfo from '../../hooks/useInfo';
import UserProfile from './Formats/UserProfile'
import CreateGroup from './CreateGroup/CreateGroup'
import Logout from './Formats/Logout'

import './Dialog.css'
import { useEffect } from 'react';

export default function Dialog() {

    const { dialogRef, dialogType, setDialogType } = useInfo();

    useEffect(() => {
        const dialogElement = dialogRef.current;
        const HandleDialogClick = (e) => {
            if (e.target.nodeName === 'DIALOG') {
                dialogRef.current.close();
                setDialogType('NONE');
            }
        }
        if (dialogElement) {
            dialogElement.addEventListener('click', HandleDialogClick);
        }
        return () => {
            if (dialogElement) {
                dialogElement.removeEventListener('click', HandleDialogClick);
            }
        }
    }, [])

    return (
        <dialog className='dialog' ref={dialogRef} >
            {dialogType === 'logout' ? <Logout dialogRef={dialogRef} /> : dialogType === 'setting' ? <UserProfile dialogRef={dialogRef} /> : dialogType === 'create-dm' ? <CreateGroup dialogRef={dialogRef} /> : null}
        </dialog >
    )
}