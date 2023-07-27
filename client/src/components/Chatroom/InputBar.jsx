function InputBar({ sendMessage, message, setMessage }) {

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
        <textarea
            rows={1}
            className='chatroom-input'
            type="text"
            placeholder="Message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
        />
    );
}

export default InputBar;