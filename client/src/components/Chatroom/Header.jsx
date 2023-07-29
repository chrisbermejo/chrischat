import React from 'react';

import useInfo from '../../hooks/useInfo';

function Conversation({ currentTab }) {
    return (
        <div className='chatroom-title-container'>
            <img className='chatroom-title-picture' height={40} width={40} src={currentTab.conversationPicture} alt='conversation-picture' />
            <h3 className='chatroom-title'>{currentTab.conversationName}</h3>
        </div >
    )
}

function Friend() {
    return (
        <div className='friend-tab-title-container'>
            <div className='friend-nav-container'>
                <h4 className='tab-title'>Friends</h4>
                <div className='line'></div>
                <div className='friend-nav'>
                    <div className='friend-nav-tab'>All</div>
                    <div className='friend-nav-tab'>Online</div>
                    <div className='friend-nav-tab'>Pending</div>
                    <button className='add-friend-tab-button'><span className='add-friend-tab-button-text'>Add Friend</span></button>
                </div>
            </div>
            <div className='friend-nav-empty-space'></div>
        </div>
    )
}

function Header() {

    const { currentTab } = useInfo();

    return (
        <div className='chatroom-title-container-container'>
            {currentTab.type === 'friend' ? <Friend /> : <Conversation currentTab={currentTab} />}
        </div>
    );
}

export default Header;