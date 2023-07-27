const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: String,
    username: String,
    email: String,
    password: String,
    picture: String,
    friendList: { type: mongoose.Schema.Types.ObjectId, ref: 'FriendList' },
    conversationList: { type: mongoose.Schema.Types.ObjectId, ref: 'ConversationList' },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('users', UserSchema);

module.exports = User;  