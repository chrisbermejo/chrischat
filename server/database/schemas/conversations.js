const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    isGroupChat: { type: Boolean, default: false },
    room: String,
    name: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    users_count: Number,
    picture: String,
    mostRecentMessageDate: {
        type: String,
        default: new Date().toLocaleString('en-US', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit'
        }),
    },
});

const Conversation = mongoose.model('conversation', ConversationSchema);

module.exports = Conversation;
