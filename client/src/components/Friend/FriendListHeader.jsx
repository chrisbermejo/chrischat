function FriendListHeader() {
    return (
        <div className='chatroom-title-container-container'>
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
        </div>
    )
};

export default FriendListHeader;