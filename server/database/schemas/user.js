const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: String,
    username: String,
    email: String,
    password: String,
    picture: String,
    timestamp: {
        type: Date,
        default: Date.now
    },
    friendList: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FriendList'
    },
    conversationList: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConversationList'
    }
});

const User = mongoose.model('users', UserSchema);

module.exports = User;  