import useInfo from '../../hooks/useInfo';
import Settings from './Formats/Settings'
import Logout from './Formats/Logout'

import './Dialog.css'
import { useEffect } from 'react';

export default function Dialog() {

    const { dialogRef, dialogType } = useInfo();

    useEffect(() => {
        const dialogElement = dialogRef.current;
        const HandleDialogClick = (e) => {
            if (e.target.nodeName === 'DIALOG') {
                console.log('closing dialog')
                dialogRef.current.close();
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
            {dialogType === 'logout' ? <Logout dialogRef={dialogRef} /> : dialogType === 'setting' ? <Settings dialogRef={dialogRef} /> : null}
        </dialog >
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