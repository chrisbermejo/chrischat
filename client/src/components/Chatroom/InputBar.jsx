import useInfo from '../../hooks/useInfo'

export function ChatRoomInputBar() {

    const { sendMessage, message, setMessage } = useInfo();

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            e.target.rows = e.target.rows + 1;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
            setMessage('');
        }
    };

    return (
        <div className='chatroom-inputs-container'>
            <textarea
                rows={1}
                className='chatroom-input'
                type="text"
                placeholder="Message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
            />
        </div>
    )
};

export function AddFriend() {
    return (
        <div className='add-friend-inputs-container'>
            <h2>Unable to message user!</h2>
            <h3>Add user to friends list to send messages to them</h3>
        </div>
    )
}