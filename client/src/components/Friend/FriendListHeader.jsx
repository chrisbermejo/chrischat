import useInfo from '../../hooks/useInfo';

function FriendListHeader() {

    const { handleFriendVisible, addFriendVisible, filter, setFilter } = useInfo();

    return (
        <div className='chatroom-title-container-container'>
            <div className='friend-tab-title-container'>
                <div className='friend-nav-container'>
                    <h4 className='tab-title'>
                        <span className="friend-logo material-symbols-outlined">group</span>
                        <span>Friends</span>
                    </h4>
                    <div className='line'></div>
                    <div className='friend-nav'>
                        <div className='friend-nav-tabs'>
                            <div onClick={() => setFilter('all')} className={filter === 'all' ? 'friend-nav-tab current-friend-filter' : 'friend-nav-tab'}>All</div>
                            <div onClick={() => setFilter('online')} className={filter === 'online' ? 'friend-nav-tab current-friend-filter' : 'friend-nav-tab'}>Online</div>
                            <div onClick={() => setFilter('pending')} className={filter === 'offline' ? 'friend-nav-tab current-friend-filter' : 'friend-nav-tab'}>Pending</div>
                        </div>
                        <button className={addFriendVisible ? 'add-friend-tab-button add-friend-tab-button-active' : 'add-friend-tab-button'} onClick={handleFriendVisible}><span className='add-friend-tab-button-text'>Add Friend</span></button>
                    </div>
                </div>
                <div className='friend-nav-empty-space'></div>
            </div>
        </div>
    )
};

export default FriendListHeader;